import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if ((status === 401 || status === 403) && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
