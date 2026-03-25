import AsyncStorage from "@react-native-async-storage/async-storage";
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
  setUser: (user: SessionUser) => void;
  signOut: () => Promise<void>;
  applyToJob: (application: Omit<JobApplication, "appliedAt">) => Promise<void>;
  hasApplied: (jobId: string) => boolean;
  getApplication: (jobId: string) => JobApplication | undefined;
};

const SESSION_USER_KEY = "session_user";
const JOB_APPLICATIONS_KEY = "job_applications";

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
    const next: JobApplication = {
      ...application,
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
