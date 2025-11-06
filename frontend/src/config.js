// ============================================
// PJICO - Configuration Constants
// Tổng Công ty Bảo hiểm Petrolimex
// ============================================

import { VI_TRANSLATIONS } from './i18n/vi-translations';

// Export translations for backward compatibility
export const MESSAGES = VI_TRANSLATIONS.messages;

// Company Information
export const COMPANY = {
  name: 'PJICO',
  shortName: 'PJICO',
  fullName: 'Tổng Công ty Bảo hiểm Petrolimex',
  englishName: 'Petrolimex Insurance Corporation',
  website: '',
  email: 'info@pjico.com.vn',
  hotline: '1900 5555 15',
  supportEmail: 'support@pjico.com.vn',
  address: {
    main: 'Tầng 8, Tòa nhà Petrovietnam, 1-5 Lê Duẩn, Quận 1, TP.HCM',
    street: '1-5 Lê Duẩn',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    country: 'Việt Nam',
  },
  social: {
  facebook: '',
  linkedin: '',
  youtube: '',
  },
  taxCode: '0123456789',
  establishedYear: 1996,
};

// Application Information
export const APP = {
  name: 'PJICO',
  fullName: 'Hệ thống Quản lý Bảo hiểm PJICO',
  version: '1.0.0',
  description: 'Hệ thống quản lý hợp đồng bảo hiểm xe cơ giới',
  copyright: `© ${new Date().getFullYear()} PJICO - Tổng Công ty Bảo hiểm Petrolimex`,
};

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  headers: { 'Content-Type': 'application/json' },
};

// Theme Colors - PJICO Brand
export const COLORS = {
  primary: '#0066cc',
  secondary: '#004d99',
  accent: '#0080ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
  light: '#e6f2ff',
  dark: '#003366',
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e8e8e8',
    300: '#d9d9d9',
    400: '#bfbfbf',
    500: '#8c8c8c',
    600: '#595959',
    700: '#434343',
    800: '#262626',
    900: '#1f1f1f',
  },
};

// Date Format
export const DATE_FORMAT = {
  display: 'DD/MM/YYYY',
  displayTime: 'DD/MM/YYYY HH:mm',
  api: 'YYYY-MM-DD',
  apiTime: 'YYYY-MM-DD HH:mm:ss',
};

// Pagination
export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  showSizeChanger: true,
  showQuickJumper: true,
};

// Contract Status
export const CONTRACT_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

export const CONTRACT_STATUS_TEXT = {
  active: 'Hiệu lực',
  expired: 'Hết hạn',
  cancelled: 'Đã hủy',
};

export const CONTRACT_STATUS_COLOR = {
  active: 'success',
  expired: 'warning',
  cancelled: 'error',
};

// Payment Status
export const PAYMENT_STATUS = {
  PAID: 'paid',
  UNPAID: 'unpaid',
};

export const PAYMENT_STATUS_TEXT = {
  paid: 'Đã thanh toán',
  unpaid: 'Chưa thanh toán',
};

export const PAYMENT_STATUS_COLOR = {
  paid: 'success',
  unpaid: 'warning',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  TRANSFER: 'transfer',
  CARD: 'card',
};

export const PAYMENT_METHODS_TEXT = {
  cash: 'Tiền mặt',
  transfer: 'Chuyển khoản',
  card: 'Thẻ',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  EMPLOYEE: 'Nhân viên',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'pjico_refresh_token',
  USER: 'pjico_user',
  THEME: 'pjico_theme',
};

/* ===========================
   NEW: Gom các key rời rạc
   =========================== */

// Lỗi chung phía FE (nếu bạn không muốn đụng vào i18n)
export const ERROR_MESSAGES = {
  NETWORK: 'Lỗi kết nối mạng',
  UNKNOWN: 'Đã có lỗi xảy ra',
  UNAUTHORIZED: 'Bạn không có quyền truy cập',
};

// Label/Action chung dùng lại nhiều nơi
export const UI_COMMON = {
  add: 'Thêm',
  addNew: 'Thêm mới',
  search: 'Tìm kiếm',
  export: 'Xuất',
  import: 'Nhập',
  print: 'In',
  refresh: 'Làm mới',
  back: 'Quay lại',
  next: 'Tiếp theo',
  previous: 'Trước',
  close: 'Đóng',
  confirm: 'Xác nhận',
  yes: 'Có',
  no: 'Không',
  ok: 'Đồng ý',
  loading: 'Đang tải...',
  noData: 'Không có dữ liệu',
  actions: 'Thao tác',
  status: 'Trạng thái',
  date: 'Ngày',
  time: 'Giờ',
  total: 'Tổng',
  filter: 'Lọc',
  clear: 'Xóa',
  apply: 'Áp dụng',
  view: 'Xem',
  details: 'Chi tiết',
  select: 'Chọn',
  selectAll: 'Chọn tất cả',
  deselectAll: 'Bỏ chọn tất cả',
  upload: 'Tải lên',
  download: 'Tải xuống',
  update: 'Cập nhật',
  create: 'Tạo mới',
  submit: 'Gửi',
  reset: 'Đặt lại',
};

// File Upload
export const FILE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  acceptedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  acceptedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'],
};

// Regex Patterns
export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(0|\+84)[0-9]{9,10}$/,
  idCard: /^[0-9]{9,12}$/,
  licensePlate: /^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/,
};

// Export default config object
const config = {
  COMPANY,
  APP,
  API_CONFIG,
  COLORS,
  DATE_FORMAT,
  PAGINATION,
  CONTRACT_STATUS,
  CONTRACT_STATUS_TEXT,
  CONTRACT_STATUS_COLOR,
  PAYMENT_STATUS,
  PAYMENT_STATUS_TEXT,
  PAYMENT_STATUS_COLOR,
  PAYMENT_METHODS,
  PAYMENT_METHODS_TEXT,
  USER_ROLES,
  STORAGE_KEYS,
  MESSAGES,
  ERROR_MESSAGES, // << thêm vào đây
  UI_COMMON,      // << và đây
  FILE_UPLOAD,
  REGEX,
};

export default config;