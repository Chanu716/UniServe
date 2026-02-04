import api from '../utils/api';

export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  changePassword: async (passwords) => {
    const response = await api.put('/auth/change-password', passwords);
    return response.data;
  },
};

export const resourceAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/resources', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },

  create: async (resourceData) => {
    const response = await api.post('/resources', resourceData);
    return response.data;
  },

  update: async (id, resourceData) => {
    const response = await api.put(`/resources/${id}`, resourceData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  },
};

export const bookingAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  create: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  searchAvailable: async (params) => {
    const response = await api.get('/bookings/available', { params });
    return response.data;
  },

  approve: async (id, notes) => {
    const response = await api.put(`/bookings/${id}/approve`, { approval_notes: notes });
    return response.data;
  },

  reject: async (id, reason) => {
    const response = await api.put(`/bookings/${id}/reject`, { rejection_reason: reason });
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },
};
