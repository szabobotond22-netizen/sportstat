const rawApiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '');

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}