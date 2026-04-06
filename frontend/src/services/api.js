/**
 * API Service
 * Axios instance with interceptors for API calls
 */

import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Application API calls
export const applicationsApi = {
  getAll: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }),
  delete: (id) => api.delete(`/applications/${id}`),
  getStats: () => api.get('/applications/stats'),
  getCompanies: () => api.get('/applications/companies/list'),
  export: () => api.get('/applications/export')
};

// Sync API calls
export const syncApi = {
  trigger: () => api.post('/sync/trigger'),
  getStatus: () => api.get('/sync/status'),
  toggle: (enabled) => api.post('/sync/toggle', { enabled }),
  preview: () => api.get('/sync/preview')
};

// Auth API calls
export const authApi = {
  login: () => api.get('/auth/login'),
  logout: () => api.get('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updatePreferences: (data) => api.put('/auth/preferences', data)
};

export default api;
