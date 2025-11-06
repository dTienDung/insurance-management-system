import api from './api';

const customerService = {
  // Lấy danh sách khách hàng
  getAll: async (params = {}) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  // Lấy chi tiết khách hàng
  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  // Tạo khách hàng mới
  create: async (data) => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  // Cập nhật khách hàng
  update: async (id, data) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  // Xóa khách hàng
  delete: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  // Tìm kiếm khách hàng
  search: async (keyword) => {
    const response = await api.get('/customers/search', { 
      params: { keyword } 
    });
    return response.data;
  }
};

export default customerService;
