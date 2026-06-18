import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
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
};

// ─── BOOKINGS ────────────────────────────────────────
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getMine: () => api.get('/bookings/mine'),
  updateStatus: (id, data) => api.put(`/bookings/${id}`, data),
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
