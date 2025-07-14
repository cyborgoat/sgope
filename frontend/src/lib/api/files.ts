import { BACKEND_URL, apiRequest, buildQueryString } from './common';

export async function fetchFiles(query: string = '') {
  try {
    const queryString = query ? `?${buildQueryString({ q: query })}` : '';
    return await apiRequest(`${BACKEND_URL}/api/files${queryString}`);
  } catch (error) {
    console.error('Error fetching files from backend:', error);
    return null;
  }
}


export interface GenerateFilenameResponse {
  ok: boolean;
  filename?: string;
}

export async function generateFilename(previews: string): Promise<GenerateFilenameResponse> {
  return apiRequest<GenerateFilenameResponse>(`${BACKEND_URL}/api/generate-filename`, {
    method: 'POST',
    body: JSON.stringify({ previews }),
  });
}
