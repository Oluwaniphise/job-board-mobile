import { API_BASE_URL, apiFetch } from "@/api/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
};

const JOBS_QUERY_KEY = ["jobs"];
const EMPLOYER_JOBS_QUERY_KEY = ["jobs", "employer"];

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
