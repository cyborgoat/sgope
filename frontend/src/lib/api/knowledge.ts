const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function fetchKnowledgeFiles() {
  const response = await fetch(`${BACKEND_URL}/api/files`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
}

export async function fetchKnowledgeFileContent(path: string) {
  const response = await fetch(`${BACKEND_URL}/api/files/content?path=${encodeURIComponent(path)}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
}

export async function saveKnowledgeFileContent(path: string, content: string) {
  const response = await fetch(`${BACKEND_URL}/api/files/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path, content }),
  });
  if (!response.ok) {
    throw new Error('Failed to save file content');
  }
  return response.json();
}
