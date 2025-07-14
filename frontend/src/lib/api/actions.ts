import { BACKEND_URL, apiRequest, buildQueryString } from './common';

export async function fetchActions(query: string = '') {
  try {
    const queryString = query ? `?${buildQueryString({ q: query })}` : '';
    return await apiRequest(`${BACKEND_URL}/api/actions${queryString}`);
  } catch (error) {
    console.error('Error fetching actions from backend:', error);
    return null;
  }
}
