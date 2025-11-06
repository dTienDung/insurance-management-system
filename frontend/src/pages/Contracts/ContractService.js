import { contractAPI } from '../../services/api';

export const contractService = {
  // Lấy danh sách tất cả hợp đồng
  getAll: async (params = {}) => {
    const response = await contractAPI.getAll(params);
    return response.data;
  },

  // Lấy thông tin chi tiết hợp đồng theo ID
  getById: async (id) => {
    const response = await contractAPI.getById(id);
    return response.data;
  },

  // Lấy danh sách hợp đồng sắp hết hạn
  getExpiring: async (params = {}) => {
    const response = await contractAPI.getAll({ ...params, expiring: true });
    return response.data;
  },

  // Tạo hợp đồng mới
  create: async (contractData) => {
    const response = await contractAPI.create(contractData);
    return response.data;
  },

  // Cập nhật thông tin hợp đồng
  update: async (id, contractData) => {
    const response = await contractAPI.update(id, contractData);
    return response.data;
  },

  // Xóa hợp đồng
  delete: async (id) => {
    const response = await contractAPI.delete(id);
    return response.data;
  },

  // Hủy hợp đồng
  cancel: async (id, reason) => {
    const response = await contractAPI.delete(id, { data: { reason } });
    return response.data;
  },

  // Tái tục hợp đồng
  renew: async (id, renewData) => {
    const response = await contractAPI.update(id, renewData);
    return response.data;
  },

  // ============================================
  // PAYMENT METHODS
  // ============================================

  updatePaymentStatus: async (id, paymentData) => {
    const response = await contractAPI.update(id, {
      payment_status: 'paid',
      payment_date: paymentData.payment_date,
      payment_method: paymentData.payment_method,
      payment_notes: paymentData.payment_notes || ''
    });
    return response.data;
  },

  getPaymentInfo: async (id) => {
    const response = await contractAPI.getById(id);
    const payload = response.data;
    const contract = payload.contract || payload;
    return {
      payment_status: contract.payment_status,
      payment_date: contract.payment_date,
      payment_method: contract.payment_method,
      payment_notes: contract.payment_notes,
      premium_amount: contract.premium_amount
    };
  },

  markAsUnpaid: async (id) => {
    const response = await contractAPI.update(id, {
      payment_status: 'unpaid',
      payment_date: null,
      payment_method: null,
      payment_notes: null
    });
    return response.data;
  },

  getByPaymentStatus: async (paymentStatus) => {
    const response = await contractAPI.getAll({ payment_status: paymentStatus });
    return response.data;
  },

  getPaymentStatistics: async (params = {}) => {
    const response = await contractAPI.getAll(params);
    const contracts = response.data || [];
    const stats = {
      total: contracts.length,
      paid: contracts.filter(c => c.payment_status === 'paid').length,
      unpaid: contracts.filter(c => c.payment_status === 'unpaid').length,
      totalAmount: contracts.reduce((sum, c) => sum + (parseFloat(c.premium_amount) || 0), 0),
      paidAmount: contracts.filter(c => c.payment_status === 'paid').reduce((sum, c) => sum + (parseFloat(c.premium_amount) || 0), 0),
      unpaidAmount: contracts.filter(c => c.payment_status === 'unpaid').reduce((sum, c) => sum + (parseFloat(c.premium_amount) || 0), 0)
    };
    return stats;
  }
};

export default contractService;