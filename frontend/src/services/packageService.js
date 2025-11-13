import api from './api';

const packageService = {
  // Lấy danh sách tất cả gói bảo hiểm
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/packages', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy danh sách gói đang hoạt động (cho autocomplete)
  getActive: async () => {
    try {
      const response = await api.get('/packages/active');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy chi tiết gói bảo hiểm
  getById: async (id) => {
    try {
      const response = await api.get(`/packages/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Tạo gói bảo hiểm mới
  create: async (data) => {
    try {
      const response = await api.post('/packages', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cập nhật gói bảo hiểm
  update: async (id, data) => {
    try {
      const response = await api.put(`/packages/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Xóa gói bảo hiểm
  delete: async (id) => {
    try {
      const response = await api.delete(`/packages/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default packageService;
