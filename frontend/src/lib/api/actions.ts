const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function fetchActions(query: string = '') {
  // Use the same logic as chat stream: always call backend directly, never rely on Next.js API
  try {
    const response = await fetch(`${BACKEND_URL}/api/actions?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching actions from backend:', error);
    return null;
  }
}
