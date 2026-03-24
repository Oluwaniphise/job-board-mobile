import { API_BASE_URL, apiFetch } from "@/api/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract";
  salaryRange: string;
  summary: string;
  description: string;
  requirements: string[];
};

const JOBS_QUERY_KEY = ["jobs"];

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

export const useInvalidateJobs = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
  };
};
