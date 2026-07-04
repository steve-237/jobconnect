import axios from 'axios';

// Instance Axios pointant vers l'API NestJS
export const api = axios.create({
  baseURL: 'http://localhost:3000', // Port du backend par défaut
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour attacher le JWT à chaque requête automatiquement
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
