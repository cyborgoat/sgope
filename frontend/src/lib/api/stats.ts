import { BACKEND_URL, apiRequest } from './common';

export async function fetchStats() {
  return apiRequest(`${BACKEND_URL}/api/stats`);
}

export async function refreshKnowledge() {
  return apiRequest(`${BACKEND_URL}/api/refresh`, { method: 'POST' });
}
