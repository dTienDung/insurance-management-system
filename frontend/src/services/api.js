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
          message.error(
            error.response.data?.message || 
            MESSAGES.ERROR.UNKNOWN  // ← DÙNG CONFIG
          );
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      message.error(MESSAGES.ERROR.NETWORK);  // ← DÙNG CONFIG
    } else {
      // Lỗi khác
      message.error(MESSAGES.ERROR.UNKNOWN);  // ← DÙNG CONFIG
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
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

export const vehicleAPI = {
  getAll: () => api.get('/vehicles'),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

export const contractAPI = {
  getAll: () => api.get('/contracts'),
  getById: (id) => api.get(`/contracts/${id}`),
  create: (data) => api.post('/contracts', data),
  update: (id, data) => api.put(`/contracts/${id}`, data),
  delete: (id) => api.delete(`/contracts/${id}`),
};