import { BACKEND_URL, apiRequest, buildQueryString } from './common';

export async function fetchKnowledgeFiles() {
  return apiRequest(`${BACKEND_URL}/api/files`);
}

export async function fetchKnowledgeFileContent(path: string) {
  const queryString = buildQueryString({ path });
  return apiRequest(`${BACKEND_URL}/api/files/content?${queryString}`);
}

export async function saveKnowledgeFileContent(path: string, content: string) {
  return apiRequest(`${BACKEND_URL}/api/files/content`, {
    method: 'POST',
    body: JSON.stringify({ path, content }),
  });
}
