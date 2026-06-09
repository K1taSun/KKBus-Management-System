import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // IMPORTANT: Allows cookies/session sharing
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    if ((status === 401 || status === 403) && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
      return new Promise(() => {}); // Prevent further execution while redirecting
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Generic GET
export const apiGet = async <T>(url: string, params?: any): Promise<T> => {
  return apiClient.get<T, T>(url, { params });
};

// Generic POST
export const apiPost = async <T>(url: string, data?: any): Promise<T> => {
  return apiClient.post<T, T>(url, data);
};

// Generic PUT
export const apiPut = async <T>(url: string, data?: any): Promise<T> => {
  return apiClient.put<T, T>(url, data);
};

// Generic DELETE
export const apiDelete = async <T>(url: string): Promise<T> => {
  return apiClient.delete<T, T>(url);
};

// Generic PATCH
export const apiPatch = async <T>(url: string, data?: any): Promise<T> => {
  return apiClient.patch<T, T>(url, data);
};
