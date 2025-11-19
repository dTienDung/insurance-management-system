import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS, MESSAGES } from '../config';  // ← IMPORT CONFIG
import { message } from 'antd';

// ============================================
// CREATE AXIOS INSTANCE - DÙNG CONFIG
// ============================================

const api = axios.create({
  baseURL: API_CONFIG.baseURL,      // ← DÙNG CONFIG
  timeout: API_CONFIG.timeout,       // ← DÙNG CONFIG
  headers: API_CONFIG.headers,       // ← DÙNG CONFIG
});

// ============================================
// REQUEST INTERCEPTOR - THÊM TOKEN
// ============================================

api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage - DÙNG STORAGE_KEYS từ config
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);  // ← DÙNG CONFIG
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR - XỬ LÝ LỖI
// ============================================

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý các lỗi thông dụng
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - Token hết hạn hoặc không hợp lệ
          message.error(MESSAGES.ERROR.UNAUTHORIZED);  // ← DÙNG CONFIG
          
          // Xóa token và redirect về login
          localStorage.removeItem(STORAGE_KEYS.TOKEN);       // ← DÙNG CONFIG
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN); // ← DÙNG CONFIG
          localStorage.removeItem(STORAGE_KEYS.USER);        // ← DÙNG CONFIG
          
          // Redirect về login (nếu không phải đang ở trang login)
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;

        case 403:
          // Forbidden - Không có quyền truy cập
          message.error('Bạn không có quyền thực hiện thao tác này');
          break;

        case 404:
          // Not Found
          message.error(MESSAGES.ERROR.NOT_FOUND);  // ← DÙNG CONFIG
          break;

        case 500:
          // Server Error
          message.error('Lỗi server nội bộ. Vui lòng thử lại sau!');
          break;

        default:
          // Các lỗi khác
          const errorMessage = error.response.data?.message || 
            MESSAGES?.ERROR?.UNKNOWN || 'Đã xảy ra lỗi không xác định';
          message.error(errorMessage);
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      message.error(MESSAGES?.ERROR?.NETWORK || 'Lỗi kết nối mạng');
    } else {
      // Lỗi khác
      message.error(MESSAGES?.ERROR?.UNKNOWN || 'Đã xảy ra lỗi không xác định');
    }

    return Promise.reject(error);
  }
);

// ============================================
// EXPORT API INSTANCE
// ============================================

export default api;

// Export các API endpoints
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  getProfile: () => api.get('/auth/profile'),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRevenue: (year) => api.get(`/dashboard/revenue/${year}`),
  getContractsStatus: () => api.get('/dashboard/contracts-status'),
  getRecentActivities: () => api.get('/dashboard/recent-activities'),
};

export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

export const vehicleAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

export const contractAPI = {
  getAll: (params) => api.get('/contracts', { params }),
  getById: (id) => api.get(`/contracts/${id}`),
  create: (data) => api.post('/contracts', data),
  update: (id, data) => api.put(`/contracts/${id}`, data),
  delete: (id) => api.delete(`/contracts/${id}`),
  renew: (id) => api.post(`/contracts/${id}/renew`), // ⭐ NEW - Tái tục
  cancel: (id) => api.post(`/contracts/${id}/cancel`), // ⭐ NEW - Hủy
};

export const exportAPI = {
  exportContract: (id) => api.get(`/export/contract/${id}`, { responseType: 'blob' }),
  exportVehicle: (id) => api.get(`/export/vehicle/${id}`, { responseType: 'blob' }),
  exportCustomer: (id) => api.get(`/export/customer/${id}`, { responseType: 'blob' }),
  exportAll: (type) => api.get(`/export/${type}/all`, { responseType: 'blob' }),
  
  // ⭐ NEW - Export chứng từ
  exportGiayYeuCau: (maKH, maXe) => api.get(`/export/giay-yeu-cau/${maKH}/${maXe}`, { responseType: 'blob' }),
  exportHopDong: (maHD) => api.get(`/export/hop-dong/${maHD}`, { responseType: 'blob' }),
  exportBienLai: (maTT) => api.get(`/export/bien-lai/${maTT}`, { responseType: 'blob' }),
  exportGiayChungNhan: (maHD) => api.get(`/export/giay-chung-nhan/${maHD}`, { responseType: 'blob' }),
};

// ⭐ NEW - PAYMENT API
export const paymentAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getByContract: (maHD) => api.get(`/payments/contract/${maHD}`),
  create: (data) => api.post('/payments', data),
  refund: (maTT, data) => api.post(`/payments/${maTT}/refund`, data),
  getById: (maTT) => api.get(`/payments/${maTT}`),
};

// ⭐ NEW - ASSESSMENT API (cập nhật)
export const assessmentAPI = {
  getAll: (params) => api.get('/assessments', { params }),
  getByHoSo: (maHS) => api.get(`/assessments/hoso/${maHS}`),
  calculateRisk: (data) => api.post('/assessments/calculate-risk', data),
  create: (data) => api.post('/assessments', data),
};

// ⭐ NEW - HOSO API
export const hosoAPI = {
  getAll: (params) => api.get('/hoso', { params }),
  getById: (maHS) => api.get(`/hoso/${maHS}`),
  create: (data) => api.post('/hoso', data),
  update: (maHS, data) => api.put(`/hoso/${maHS}`, data),
  delete: (maHS) => api.delete(`/hoso/${maHS}`),
};

// ⭐ NEW - REPORTS API (đầy đủ)
export const reportAPI = {
  // Revenue
  getMonthlyRevenue: (params) => api.get('/reports/revenue/monthly', { params }),
  getYearlyRevenue: (params) => api.get('/reports/revenue/yearly', { params }),
  
  // Contracts
  getContractsByStatus: (params) => api.get('/reports/contracts/status', { params }),
  getContractsByType: (params) => api.get('/reports/contracts/type', { params }),
  getExpiringContracts: (params) => api.get('/reports/contracts/expiring', { params }),
  
  // NEW - 5 báo cáo mới
  getContractsDetailByStatus: (params) => api.get('/reports/contracts/detail', { params }),
  getCustomersWithContracts: (params) => api.get('/reports/customers/contracts', { params }),
  getRenewalReport: (params) => api.get('/reports/renewal', { params }),
  getAssessmentsByRiskLevel: (params) => api.get('/reports/assessments/risk-level', { params }),
  getRiskAnalysis: (params) => api.get('/reports/risk-analysis', { params }),
  
  // Dashboard
  getDashboardStats: () => api.get('/reports/dashboard'),
};