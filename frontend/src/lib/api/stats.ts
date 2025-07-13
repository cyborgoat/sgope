const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function fetchStats() {
  const response = await fetch(`${BACKEND_URL}/api/stats`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
}

export async function refreshKnowledge() {
  const response = await fetch(`${BACKEND_URL}/api/refresh`, { method: 'POST' });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
}
