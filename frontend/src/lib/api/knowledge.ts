

import { BACKEND_URL, apiRequest, buildQueryString } from './common';
import type { FileItem } from '@/types';

export interface KnowledgeFilesResponse {
  files: FileItem[];
}

export async function fetchKnowledgeFiles(): Promise<KnowledgeFilesResponse> {
  return apiRequest<KnowledgeFilesResponse>(`${BACKEND_URL}/api/files`);
}

export interface KnowledgeFileContentResponse {
  content: string;
}

export async function fetchKnowledgeFileContent(path: string): Promise<KnowledgeFileContentResponse> {
  const queryString = buildQueryString({ path });
  return apiRequest<KnowledgeFileContentResponse>(`${BACKEND_URL}/api/files/content?${queryString}`);
}

export async function saveKnowledgeFileContent(path: string, content: string) {
  return apiRequest(`${BACKEND_URL}/api/files/content`, {
    method: 'POST',
    body: JSON.stringify({ path, content }),
  });
}
