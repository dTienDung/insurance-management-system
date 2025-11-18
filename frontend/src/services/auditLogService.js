// ============================================
// PJICO - Audit Log Service
// API calls cho Audit Logs
// ============================================

import api from './api';

const auditLogService = {
  /**
   * Lấy danh sách audit logs
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/audit', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy logs theo bảng
   */
  getByTable: async (table, params = {}) => {
    try {
      const response = await api.get(`/audit/table/${table}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy lịch sử của 1 record
   */
  getByRecord: async (table, id) => {
    try {
      const response = await api.get(`/audit/record/${table}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy thống kê
   */
  getStats: async (params = {}) => {
    try {
      const response = await api.get('/audit/stats', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách bảng có audit
   */
  getTables: async () => {
    try {
      const response = await api.get('/audit/tables');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * So sánh 2 versions
   */
  compareVersions: async (params) => {
    try {
      const response = await api.get('/audit/compare', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Export to CSV
   */
  exportToCsv: async (params = {}) => {
    try {
      const response = await api.get('/audit/export', { 
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default auditLogService;
