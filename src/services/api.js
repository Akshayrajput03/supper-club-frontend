import axios from 'axios';
import logger from '../utils/logger';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token + log every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  logger.info(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// Log every response and handle 401 globally
api.interceptors.response.use(
  (res) => {
    logger.info(`API Response: ${res.status} ${res.config.url}`);
    return res;
  },
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url;
    logger.error(`API Error: ${status} ${url}`, err.response?.data);
    if (status === 401) {
      logger.warn('Unauthorized - clearing session and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// ─── LISTINGS ────────────────────────────────────────
export const listingsAPI = {
  browse: (params) => api.get('/listings', { params }),
  get: (id) => api.get(`/listings/${id}`),
  create: (data) => api.post('/listings', data),
  update: (id, data) => api.put(`/listings/${id}`, data),
  cancel: (id) => api.delete(`/listings/${id}`),
  getMine: () => api.get('/listings/mine'),
};

// ─── BOOKINGS ────────────────────────────────────────
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getMine: () => api.get('/bookings/mine'),
  updateStatus: (id, data) => api.put(`/bookings/${id}`, data),
  getForListing: (listingId) => api.get(`/bookings/listing/${listingId}`),
};

// ─── REVIEWS ─────────────────────────────────────────
export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
  getForUser: (userId) => api.get(`/reviews/${userId}`),
};

// ─── MESSAGES ────────────────────────────────────────
export const messagesAPI = {
  send: (data) => api.post('/messages', data),
  getConversation: (bookingId) => api.get(`/messages/${bookingId}`),
};

export default api;
