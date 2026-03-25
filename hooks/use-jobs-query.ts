import { API_BASE_URL, apiFetch } from "@/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type JobListing = {
  id: string;
  title: string;
  companyName: string;
  description: string;
  location: string;
  jobType: "Full-time" | "Part-time" | "Contract";
  salaryRange: string;
  experienceLevel: string;
  summary: string;
  requiredSkills: string[];
  status?: "Draft" | "Published" | "Archived";
};

export type CreateJobPayload = {
  title: string;
  companyName: string;
  location: string;
  salaryRange: string;
  requiredSkills: string[];
  jobType: "Full-time" | "Part-time" | "Contract";
  experienceLevel: string;
  status: "Draft" | "Published" | "Archived";
  description: string;
  summary: string;
};

export type EmployerJobApplication = {
  jobId: string;
  resumeUrl?: string;
  status: "Draft" | "Published" | "Archived";
  createdAt: string;
  updatedAt: string;
  id: string;
  candidateId: {
    firstName: string;
    lastName: string;
    email: string;
    id: string;
  };
};

const JOBS_QUERY_KEY = ["jobs"];
const EMPLOYER_JOBS_QUERY_KEY = ["jobs", "employer"];
const EMPLOYER_JOB_APPLICATIONS_QUERY_KEY = ["jobs", "employer", "applications"];

export const useJobs = () => {
  return useQuery<JobListing[]>({
    queryKey: JOBS_QUERY_KEY,
    queryFn: async () => {
      return apiFetch<JobListing[]>(`${API_BASE_URL}/jobs`);
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useJob = (jobId: string | undefined) => {
  return useQuery<JobListing | undefined>({
    queryKey: [...JOBS_QUERY_KEY, jobId],
    queryFn: async () => {
      if (!jobId) {
        return undefined;
      }
      return apiFetch<JobListing>(`${API_BASE_URL}/jobs/${jobId}`);
    },
    enabled: !!jobId,
  });
};

export const useEmployerJobs = (enabled = true) => {
  return useQuery<JobListing[]>({
    queryKey: EMPLOYER_JOBS_QUERY_KEY,
    queryFn: async () => {
      return apiFetch<JobListing[]>(`${API_BASE_URL}/jobs/employer`);
    },
    enabled,
    staleTime: 1000 * 60 * 2,
  });
};

export const useInvalidateJobs = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: EMPLOYER_JOBS_QUERY_KEY });
  };
};

export const useCreateJobMutation = () => {
  return useMutation({
    mutationFn: async (payload: CreateJobPayload) => {
      return apiFetch<{ id?: string; message?: string }>(`${API_BASE_URL}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    },
  });
};

export const useUpdateJobMutation = () => {
  return useMutation({
    mutationFn: async ({
      jobId,
      payload,
    }: {
      jobId: string;
      payload: CreateJobPayload;
    }) => {
      return apiFetch<{ message?: string }>(`${API_BASE_URL}/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    },
  });
};

export const useDeleteJobMutation = () => {
  return useMutation({
    mutationFn: async (jobId: string) => {
      return apiFetch<{ message?: string }>(`${API_BASE_URL}/jobs/${jobId}`, {
        method: "DELETE",
      });
    },
  });
};

export const useEmployerJobApplications = (
  jobId: string | undefined,
  enabled = true,
) => {
  return useQuery<EmployerJobApplication[]>({
    queryKey: [...EMPLOYER_JOB_APPLICATIONS_QUERY_KEY, jobId],
    queryFn: async () => {
      if (!jobId) {
        return [];
      }

      return apiFetch<EmployerJobApplication[]>(
        `${API_BASE_URL}/employer/jobs/${jobId}/applications`,
      );
    },
    enabled: enabled && !!jobId,
    staleTime: 1000 * 30,
  });
};
