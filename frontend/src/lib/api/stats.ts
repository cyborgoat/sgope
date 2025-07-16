import { BACKEND_URL, apiRequest } from "./common";
import type { SystemStats } from "@/types";

export async function fetchStats(): Promise<SystemStats> {
  return apiRequest<SystemStats>(`${BACKEND_URL}/api/stats`);
}

export async function refreshKnowledge() {
  return apiRequest(`${BACKEND_URL}/api/refresh`, { method: "POST" });
}
