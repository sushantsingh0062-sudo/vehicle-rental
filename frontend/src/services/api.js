import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to catch 401 unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // localStorage.removeItem('token');
      // localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const loginApi = (data) => api.post('/auth/login', data);
export const registerApi = (data) => api.post('/auth/register', data);

// Vehicle API calls
export const getVehiclesApi = (params) => api.get('/vehicles', { params });
export const getVehicleByIdApi = (id, params) => api.get(`/vehicles/${id}`, { params });
export const createVehicleApi = (formData) => api.post('/vehicles', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateVehicleApi = (id, formData) => api.put(`/vehicles/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteVehicleApi = (id) => api.delete(`/vehicles/${id}`);

// Booking API calls
export const createBookingApi = (data) => api.post('/bookings', data);
export const getBookingsApi = () => api.get('/bookings');
export const cancelBookingApi = (id) => api.patch(`/bookings/${id}/cancel`);

export default api;
