import api from './api';

const contractService = {
  getAll: async (params = {}) => {
    const response = await api.get('/contracts', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/contracts', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/contracts/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/contracts/${id}`);
    return response.data;
  },

  // Tái tục hợp đồng
  renew: async (id, data) => {
    const response = await api.post(`/contracts/${id}/renew`, data);
    return response.data;
  },

  // Hợp đồng sắp hết hạn
  getExpiringSoon: async () => {
    const response = await api.get('/contracts/expiring-soon');
    return response.data;
  },

  // Hủy hợp đồng
  cancel: async (id, reason) => {
    const response = await api.post(`/contracts/${id}/cancel`, { reason });
    return response.data;
  },

  // Lấy hợp đồng theo khách hàng
  getByCustomer: async (customerId) => {
    const response = await api.get(`/contracts/customer/${customerId}`);
    return response.data;
  }
};

export default contractService;
