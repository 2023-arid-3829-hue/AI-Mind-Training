export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export async function fetchGames(signal) {
  const response = await fetch(API_BASE_URL + '/api/games', { signal });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success || !Array.isArray(payload.data)) {
    throw new Error(payload?.message || 'Games could not be loaded from the backend.');
  }

  return payload.data;
}
