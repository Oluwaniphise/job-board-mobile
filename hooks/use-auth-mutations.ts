import { API_BASE_URL, apiFetch } from "@/api/client";
import { SessionUser } from "@/stores/session-store";
import { useMutation } from "@tanstack/react-query";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: {
    email: string;
    role: SessionUser["role"];
  };
};

export type SignupData = {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: "Candidate" | "Employer";
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (
      credentials: LoginCredentials,
    ): Promise<LoginResponse> => {
      return apiFetch<LoginResponse>(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
    },
  });
};

export const useSignupMutation = () => {
  return useMutation({
    mutationFn: async (data: SignupData) => {
      return apiFetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
  });
};
