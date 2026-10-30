import axios from 'axios';

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return 'https://jobconnect-backend.onrender.com';
    }
  }
  return 'http://localhost:4000';
}

// Instance Axios pointant vers l'API NestJS
export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour attacher le JWT à chaque requête automatiquement
api.interceptors.request.use((config) => {
  config.baseURL = getBaseUrl();
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercepteur pour gérer l'expiration de session et les erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error?.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

      if (!isAuthEndpoint) {
        localStorage.removeItem('token');
        const pathname = window.location.pathname;
        const search = window.location.search;
        const currentPath = pathname + search;

        // Éviter une boucle si déjà sur /login ou /register
        if (!pathname.startsWith('/login') && !pathname.startsWith('/register')) {
          const redirectUrl = `/login?expired=true&redirect=${encodeURIComponent(currentPath)}`;
          window.location.href = redirectUrl;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
