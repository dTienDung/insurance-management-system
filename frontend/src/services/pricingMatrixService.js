// ============================================
// PJICO - Pricing Matrix Service
// API calls cho Ma trận định phí
// ============================================

import api from './api';

const pricingMatrixService = {
  /**
   * Lấy danh sách hệ số phí
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/pricing', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy chi tiết 1 hệ số
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/pricing/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tạo hệ số mới
   */
  create: async (data) => {
    try {
      const response = await api.post('/pricing', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật hệ số
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/pricing/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa hệ số
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/pricing/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tính phí bảo hiểm
   */
  calculatePremium: async (params) => {
    try {
      const response = await api.get('/pricing/calculate', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy ma trận đầy đủ
   */
  getMatrix: async () => {
    try {
      const response = await api.get('/pricing/matrix');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default pricingMatrixService;
