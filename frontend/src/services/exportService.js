import { exportAPI } from './api';

export const exportService = {
  /**
   * Export Giấy yêu cầu bảo hiểm
   * @param {number} customerId - ID khách hàng
   * @param {number} vehicleId - ID phương tiện
   * @returns {Promise<Blob>} PDF blob
   */
  exportGiayYeuCau: async (customerId, vehicleId) => {
    try {
      const response = await exportAPI.exportGiayYeuCau(customerId, vehicleId);
      return response.data;
    } catch (error) {
      console.error('Error exporting giay yeu cau:', error);
      throw error;
    }
  },

  /**
   * Export Hợp đồng bảo hiểm
   * @param {number} contractId - ID hợp đồng
   * @returns {Promise<Blob>} PDF blob
   */
  exportHopDong: async (contractId) => {
    try {
      const response = await exportAPI.exportHopDong(contractId);
      return response.data;
    } catch (error) {
      console.error('Error exporting hop dong:', error);
      throw error;
    }
  },

  /**
   * Export Biên lai thu tiền
   * @param {number} paymentId - ID thanh toán hoặc contract ID
   * @returns {Promise<Blob>} PDF blob
   */
  exportBienLai: async (paymentId) => {
    try {
      const response = await exportAPI.exportBienLai(paymentId);
      return response.data;
    } catch (error) {
      console.error('Error exporting bien lai:', error);
      throw error;
    }
  },

  /**
   * Export báo cáo Excel
   * @param {string} type - Loại báo cáo (contracts, customers, vehicles, etc.)
   * @param {Object} params - Tham số filter
   * @returns {Promise<Blob>} Excel blob
   */
  exportReport: async (type, params = {}) => {
    try {
      const response = await exportAPI.exportReport(type, params);
      return response.data;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  },

  /**
   * Helper: Download file từ blob
   * @param {Blob} blob - File blob
   * @param {string} filename - Tên file
   */
  downloadBlob: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Helper: Mở file trong tab mới
   * @param {Blob} blob - File blob
   */
  openBlobInNewTab: (blob) => {
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Note: URL sẽ bị revoke sau khi tab đóng
  },

  /**
   * Export danh sách hợp đồng
   * @param {Object} filters - Bộ lọc
   * @returns {Promise<Blob>} Excel blob
   */
  exportContractsList: async (filters = {}) => {
    try {
      const response = await exportAPI.exportReport('contracts', filters);
      return response.data;
    } catch (error) {
      console.error('Error exporting contracts list:', error);
      throw error;
    }
  },

  /**
   * Export danh sách khách hàng
   * @param {Object} filters - Bộ lọc
   * @returns {Promise<Blob>} Excel blob
   */
  exportCustomersList: async (filters = {}) => {
    try {
      const response = await exportAPI.exportReport('customers', filters);
      return response.data;
    } catch (error) {
      console.error('Error exporting customers list:', error);
      throw error;
    }
  },

  /**
   * Export danh sách phương tiện
   * @param {Object} filters - Bộ lọc
   * @returns {Promise<Blob>} Excel blob
   */
  exportVehiclesList: async (filters = {}) => {
    try {
      const response = await exportAPI.exportReport('vehicles', filters);
      return response.data;
    } catch (error) {
      console.error('Error exporting vehicles list:', error);
      throw error;
    }
  },

  /**
   * Export báo cáo doanh thu
   * @param {Object} params - Tham số (from_date, to_date)
   * @returns {Promise<Blob>} Excel blob
   */
  exportRevenueReport: async (params = {}) => {
    try {
      const response = await exportAPI.exportReport('revenue', params);
      return response.data;
    } catch (error) {
      console.error('Error exporting revenue report:', error);
      throw error;
    }
  },

  // ============================================
  // CONVENIENCE METHODS - ĐÃ SỬA LỖI
  // Đổi từ arrow function sang normal function để dùng 'this'
  // ============================================

  /**
   * Export và download hợp đồng
   * @param {number} contractId - ID hợp đồng
   * @param {string} contractNumber - Số hợp đồng (để đặt tên file)
   */
  downloadContract: async function(contractId, contractNumber) {
    try {
      const blob = await this.exportHopDong(contractId);
      const filename = `HopDong_${contractNumber}_${new Date().getTime()}.pdf`;
      this.downloadBlob(blob, filename);
    } catch (error) {
      console.error('Error downloading contract:', error);
      throw error;
    }
  },

  /**
   * Export và download biên lai
   * @param {number} paymentId - ID thanh toán
   * @param {string} contractNumber - Số hợp đồng (để đặt tên file)
   */
  downloadReceipt: async function(paymentId, contractNumber) {
    try {
      const blob = await this.exportBienLai(paymentId);
      const filename = `BienLai_${contractNumber}_${new Date().getTime()}.pdf`;
      this.downloadBlob(blob, filename);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      throw error;
    }
  },

  /**
   * Export và download giấy yêu cầu
   * @param {number} customerId - ID khách hàng
   * @param {number} vehicleId - ID phương tiện
   * @param {string} licensePlate - Biển số xe (để đặt tên file)
   */
  downloadRequest: async function(customerId, vehicleId, licensePlate) {
    try {
      const blob = await this.exportGiayYeuCau(customerId, vehicleId);
      const filename = `GiayYeuCau_${licensePlate}_${new Date().getTime()}.pdf`;
      this.downloadBlob(blob, filename);
    } catch (error) {
      console.error('Error downloading request form:', error);
      throw error;
    }
  }
};

export default exportService;