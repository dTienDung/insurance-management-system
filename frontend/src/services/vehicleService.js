import api from './api';

const vehicleService = {
  getAll: async (params = {}) => {
    const response = await api.get('/vehicles', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/vehicles', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  getByCustomer: async (customerId) => {
    const response = await api.get(`/vehicles/customer/${customerId}`);
    return response.data;
  },

  getHistory: async (id) => {
    const response = await api.get(`/vehicles/${id}/history`);
    return response.data;
  }
};

export default vehicleService;
