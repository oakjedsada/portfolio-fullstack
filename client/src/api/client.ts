import type { Project, Skill } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getProjects: () => request<Project[]>("/api/projects"),
  getSkills: () => request<Skill[]>("/api/skills"),
  sendContact: (payload: { name: string; email: string; message: string }) =>
    request<{ success: boolean; id: number }>("/api/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
