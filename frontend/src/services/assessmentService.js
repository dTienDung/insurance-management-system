import api from './api';

const API_BASE = '/assessments';

export const assessmentService = {
  // Lấy danh sách tất cả định giá
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.contract_id) queryParams.append('contract_id', params.contract_id);
      if (params.status) queryParams.append('status', params.status);
      if (params.from_date) queryParams.append('from_date', params.from_date);
      if (params.to_date) queryParams.append('to_date', params.to_date);
      if (params.min_value) queryParams.append('min_value', params.min_value);
      if (params.max_value) queryParams.append('max_value', params.max_value);
      if (params.assessor_name) queryParams.append('assessor_name', params.assessor_name);
      
      const queryString = queryParams.toString();
      const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết định giá theo ID
  getById: async (id) => {
    try {
      const response = await api.get(`${API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching assessment ${id}:`, error);
      throw error;
    }
  },

  // Tạo định giá mới
  create: async (assessmentData) => {
    try {
      const response = await api.post(API_BASE, assessmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  },

  // Cập nhật thông tin định giá
  update: async (id, assessmentData) => {
    try {
      const response = await api.put(`${API_BASE}/${id}`, assessmentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating assessment ${id}:`, error);
      throw error;
    }
  },

  // Xóa định giá
  delete: async (id) => {
    try {
      const response = await api.delete(`${API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting assessment ${id}:`, error);
      throw error;
    }
  },

  // Cập nhật trạng thái định giá
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`${API_BASE}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating assessment status ${id}:`, error);
      throw error;
    }
  },

  // Lấy danh sách định giá theo hợp đồng
  getByContract: async (contractId) => {
    try {
      const response = await api.get(`${API_BASE}/contract/${contractId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching assessments for contract ${contractId}:`, error);
      throw error;
    }
  },

  // Lấy thống kê định giá
  getStatistics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.from_date) queryParams.append('from_date', params.from_date);
      if (params.to_date) queryParams.append('to_date', params.to_date);
      if (params.status) queryParams.append('status', params.status);
      
      const queryString = queryParams.toString();
      const url = queryString 
        ? `${API_BASE}/statistics?${queryString}` 
        : `${API_BASE}/statistics`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment statistics:', error);
      throw error;
    }
  },

  // Duyệt định giá
  approve: async (id, notes = '') => {
    try {
      const response = await api.post(`${API_BASE}/${id}/approve`, { notes });
      return response.data;
    } catch (error) {
      console.error(`Error approving assessment ${id}:`, error);
      throw error;
    }
  },

  // Từ chối định giá
  reject: async (id, reason = '') => {
    try {
      const response = await api.post(`${API_BASE}/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Error rejecting assessment ${id}:`, error);
      throw error;
    }
  },

  // Lấy lịch sử định giá của một phương tiện
  getVehicleAssessmentHistory: async (vehicleId) => {
    try {
      const response = await api.get(`${API_BASE}/vehicle/${vehicleId}/history`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching assessment history for vehicle ${vehicleId}:`, error);
      throw error;
    }
  },

  // So sánh định giá
  compareAssessments: async (assessmentIds) => {
    try {
      const response = await api.post(`${API_BASE}/compare`, { assessment_ids: assessmentIds });
      return response.data;
    } catch (error) {
      console.error('Error comparing assessments:', error);
      throw error;
    }
  },

  // Export định giá ra file
  exportAssessments: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.from_date) queryParams.append('from_date', params.from_date);
      if (params.to_date) queryParams.append('to_date', params.to_date);
      if (params.status) queryParams.append('status', params.status);
      if (params.format) queryParams.append('format', params.format); // 'excel' hoặc 'pdf'
      
      const queryString = queryParams.toString();
      const url = queryString 
        ? `${API_BASE}/export?${queryString}` 
        : `${API_BASE}/export`;
      
      const response = await api.get(url, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exporting assessments:', error);
      throw error;
    }
  },

  // Tính toán giá trị định giá tự động (nếu backend có chức năng này)
  calculateValue: async (vehicleData) => {
    try {
      const response = await api.post(`${API_BASE}/calculate`, vehicleData);
      return response.data;
    } catch (error) {
      console.error('Error calculating assessment value:', error);
      throw error;
    }
  },

  // Lấy danh sách người định giá
  getAssessors: async () => {
    try {
      const response = await api.get(`${API_BASE}/assessors`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessors:', error);
      throw error;
    }
  },

  // Tìm kiếm định giá
  search: async (searchTerm) => {
    try {
      const response = await api.get(`${API_BASE}/search?q=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching assessments:', error);
      throw error;
    }
  }
};

export default assessmentService;
