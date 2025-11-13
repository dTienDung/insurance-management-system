import api from './api';

const contractService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/contracts', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/contracts/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/contracts', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/contracts/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/contracts/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy hợp đồng sắp hết hạn
  getExpiring: async (days = 30) => {
    try {
      const response = await api.get('/contracts/expiring', { params: { days } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy lịch sử quan hệ hợp đồng (renewal/transfer)
  getRelations: async (id) => {
    try {
      const response = await api.get(`/contracts/${id}/relations`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Tái tục hợp đồng
  renew: async (id) => {
    try {
      const response = await api.post(`/contracts/${id}/renew`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Hủy hợp đồng (có hoàn tiền)
  cancel: async (id, lyDo) => {
    try {
      const response = await api.post(`/contracts/${id}/cancel`, { lyDo });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Chuyển nhượng hợp đồng (tạo hồ sơ thẩm định mới)
  transfer: async (id, maKHMoi, lyDo) => {
    try {
      const response = await api.post(`/contracts/${id}/transfer`, { maKHMoi, lyDo });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ============================================
  // TẢI CHỨNG TỪ - GIẤY TỜ
  // ============================================

  /**
   * Tải Giấy chứng nhận bảo hiểm
   */
  downloadCertificate: async (contractId) => {
    try {
      const response = await api.get(`/contracts/${contractId}/certificate`, {
        responseType: 'blob'
      });
      
      // Tạo URL từ blob và tự động download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ChungNhan_BaoHiem_${contractId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Đã tải giấy chứng nhận' };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Tải Hợp đồng bảo hiểm chi tiết
   */
  downloadContract: async (contractId) => {
    try {
      const response = await api.get(`/contracts/${contractId}/document`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `HopDong_BaoHiem_${contractId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Đã tải hợp đồng' };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Tải Biên lai thu phí
   */
  downloadReceipt: async (paymentId) => {
    try {
      const response = await api.get(`/contracts/payment/${paymentId}/receipt`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BienLai_${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Đã tải biên lai' };
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default contractService;
