// ============================================
// PJICO - Assessment Criteria Service
// API calls cho Ma trận thẩm định
// ============================================

import api from './api';

const assessmentCriteriaService = {
  /**
   * Lấy danh sách tiêu chí thẩm định
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/criteria', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy chi tiết 1 tiêu chí
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/criteria/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tạo tiêu chí mới
   */
  create: async (data) => {
    try {
      const response = await api.post('/criteria', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật tiêu chí
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/criteria/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa tiêu chí
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/criteria/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy thống kê sử dụng
   */
  getStats: async () => {
    try {
      const response = await api.get('/criteria/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default assessmentCriteriaService;
