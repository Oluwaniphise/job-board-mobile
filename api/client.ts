import { useSessionStore } from "@/stores/session-store";

export const API_BASE_URL = "https://job-board-napn.onrender.com/api/v1";

export async function apiFetch<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const token = useSessionStore.getState().user?.token;

  const headers = new Headers(init?.headers);
  // Don't include token for auth endpoints
  if (token && !String(input).includes("/auth/")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(input, { ...init, headers });
  if (!res.ok) {
    const body = await res.text();
    let errorMessage = `API request failed (${res.status})`;

    try {
      const errorJson = JSON.parse(body);
      errorMessage = errorJson.message || errorMessage;
    } catch {
      errorMessage = body || errorMessage;
    }

    throw new Error(errorMessage);
  }
  return res.json();
}
