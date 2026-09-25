import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// There's no router mounted in this app (see AppContent in App.tsx — navigation is
// plain React state, not URL-based), so a hard "redirect to /login" doesn't fit here.
// Instead, AuthContext registers a logout callback below; on any 401 we call it so the
// app's existing auth state flips to logged-out and the UI reacts on its own.
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void) {
  onUnauthorized = callback;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;