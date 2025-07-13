const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface FilePreview {
  // Define the structure of a file preview as needed
  // Example:
  name: string;
  content: string;
  [key: string]: unknown;
}

export async function generateFilename(previews: FilePreview[] | object) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/generate-filename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ previews }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error generating filename from backend:', error);
    return null;
  }
}
