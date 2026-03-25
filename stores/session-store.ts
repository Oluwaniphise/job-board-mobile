import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, apiFetch } from "@/api/client";
import { create } from "zustand";

export type SessionUser = {
  email: string;
  token: string;
  role: "Candidate" | "Employer";
};

export type JobApplication = {
  jobId: string;
  resumeName: string;
  resumeUri: string;
  coverLetter?: string;
  appliedAt: string;
};

type SessionState = {
  user: SessionUser | null;
  applications: JobApplication[];
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  syncMyApplications: () => Promise<JobApplication[]>;
  setUser: (user: SessionUser) => void;
  signOut: () => Promise<void>;
  applyToJob: (application: {
    jobId: string;
    resumeName: string;
    resumeUri: string;
    resumeType?: string;
    coverLetter?: string;
  }) => Promise<void>;
  hasApplied: (jobId: string) => boolean;
  getApplication: (jobId: string) => JobApplication | undefined;
};

const SESSION_USER_KEY = "session_user";
const JOB_APPLICATIONS_KEY = "job_applications";

function extractApplicationsPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const candidate = payload as Record<string, unknown>;
  if (Array.isArray(candidate.applications)) {
    return candidate.applications;
  }

  if (candidate.data && typeof candidate.data === "object") {
    const data = candidate.data as Record<string, unknown>;
    if (Array.isArray(data.applications)) {
      return data.applications;
    }
    if (Array.isArray(data.items)) {
      return data.items;
    }
  }

  if (Array.isArray(candidate.items)) {
    return candidate.items;
  }

  return [];
}

function normalizeApplication(
  raw: unknown,
  fallbackJobId?: string,
): JobApplication | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Record<string, unknown>;
  const nestedJob =
    item.job && typeof item.job === "object"
      ? (item.job as Record<string, unknown>)
      : undefined;

  const rawJobId =
    fallbackJobId ??
    item.jobId ??
    item.job_id ??
    item.jobID ??
    nestedJob?.id ??
    nestedJob?.jobId;

  if (!rawJobId) {
    return null;
  }

  const rawResumeName =
    item.resumeName ?? item.resume_name ?? item.file_name ?? "Resume";
  const rawResumeUri =
    item.resumeUri ??
    item.resume_uri ??
    item.resumeUrl ??
    item.resume_url ??
    item.file_url ??
    "";
  const rawCoverLetter = item.coverLetter ?? item.cover_letter;
  const rawAppliedAt =
    item.appliedAt ?? item.applied_at ?? item.createdAt ?? item.created_at;

  return {
    jobId: String(rawJobId),
    resumeName: String(rawResumeName),
    resumeUri: String(rawResumeUri),
    coverLetter:
      typeof rawCoverLetter === "string" ? rawCoverLetter : undefined,
    appliedAt:
      typeof rawAppliedAt === "string"
        ? rawAppliedAt
        : new Date().toISOString(),
  };
}

function normalizeStoredUser(raw: unknown): SessionUser | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Partial<SessionUser>;
  if (!candidate.email || !candidate.token) {
    return null;
  }

  return {
    email: candidate.email,
    token: candidate.token,
    role: candidate.role === "Employer" ? "Employer" : "Candidate",
  };
}

export const useSessionStore = create<SessionState>((set, get) => ({
  user: null,
  applications: [],
  isHydrating: true,

  hydrate: async () => {
    try {
      const [storedUser, storedApplications] = await Promise.all([
        AsyncStorage.getItem(SESSION_USER_KEY),
        AsyncStorage.getItem(JOB_APPLICATIONS_KEY),
      ]);

      set({
        user: storedUser ? normalizeStoredUser(JSON.parse(storedUser)) : null,
        applications: storedApplications
          ? (JSON.parse(storedApplications) as JobApplication[])
          : [],
      });
    } finally {
      set({ isHydrating: false });
    }
  },

  syncMyApplications: async () => {
    const user = get().user;
    if (!user || user.role !== "Candidate") {
      return get().applications;
    }

    const response = await apiFetch<unknown>(
      `${API_BASE_URL}/candidate/applications/me`,
    );
    const list = extractApplicationsPayload(response)
      .map((item) => normalizeApplication(item))
      .filter((item): item is JobApplication => !!item);

    set({ applications: list });
    await AsyncStorage.setItem(JOB_APPLICATIONS_KEY, JSON.stringify(list));
    return list;
  },

  setUser: (user) => {
    set({ user });
    AsyncStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  },

  signOut: async () => {
    set({ user: null, applications: [] });
    await AsyncStorage.removeItem(SESSION_USER_KEY);
    await AsyncStorage.removeItem(JOB_APPLICATIONS_KEY);
  },

  applyToJob: async (application) => {
    const formData = new FormData();

    const trimmedCoverLetter = application.coverLetter?.trim();
    if (trimmedCoverLetter) {
      formData.append("cover_letter", trimmedCoverLetter);
    }

    formData.append("resume", {
      uri: application.resumeUri,
      name: application.resumeName,
      type: application.resumeType ?? "application/octet-stream",
    } as any);

    await apiFetch<{ message?: string }>(
      `${API_BASE_URL}/candidate/jobs/${application.jobId}/applications`,
      {
        method: "POST",
        body: formData,
      },
    );

    const next: JobApplication = {
      jobId: application.jobId,
      resumeName: application.resumeName,
      resumeUri: application.resumeUri,
      coverLetter: trimmedCoverLetter,
      appliedAt: new Date().toISOString(),
    };

    const previous = get().applications;
    const filtered = previous.filter(
      (item) => item.jobId !== application.jobId,
    );
    const updated = [next, ...filtered];

    set({ applications: updated });
    await AsyncStorage.setItem(JOB_APPLICATIONS_KEY, JSON.stringify(updated));
  },

  hasApplied: (jobId) =>
    get().applications.some((application) => application.jobId === jobId),

  getApplication: (jobId) =>
    get().applications.find((application) => application.jobId === jobId),
}));
