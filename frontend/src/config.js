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
  DRAFT: 'DRAFT',
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  TERMINATED: 'TERMINATED',
  RENEWED: 'RENEWED',
};

export const CONTRACT_STATUS_TEXT = {
  DRAFT: 'Khởi tạo',
  PENDING_PAYMENT: 'Chờ thanh toán',
  ACTIVE: 'Đang hiệu lực',
  EXPIRED: 'Hết hạn',
  CANCELLED: 'Đã hủy',
  TERMINATED: 'Chấm dứt',
  RENEWED: 'Đã tái tục',
};

export const CONTRACT_STATUS_COLOR = {
  DRAFT: 'default',
  PENDING_PAYMENT: 'warning',
  ACTIVE: 'success',
  EXPIRED: 'error',
  CANCELLED: 'error',
  TERMINATED: 'error',
  RENEWED: 'info',
};

// Payment Status
export const PAYMENT_STATUS = {
  THANH_CONG: 'Thành công',
  THAT_BAI: 'Thất bại',
  CHO_XU_LY: 'Chờ xử lý',
  HOAN_TRA: 'Hoàn trả',
};

export const PAYMENT_STATUS_TEXT = {
  'Thành công': 'Thành công',
  'Thất bại': 'Thất bại',
  'Chờ xử lý': 'Chờ xử lý',
  'Hoàn trả': 'Hoàn trả',
};

export const PAYMENT_STATUS_COLOR = {
  'Thành công': 'success',
  'Thất bại': 'error',
  'Chờ xử lý': 'warning',
  'Hoàn trả': 'info',
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

// Transaction Types
export const TRANSACTION_TYPE = {
  THANH_TOAN: 'Thanh toán',
  HOAN_PHI: 'Hoàn phí',
};

export const TRANSACTION_TYPE_TEXT = {
  'Thanh toán': 'Thanh toán',
  'Hoàn phí': 'Hoàn phí',
};

// Assessment Status
export const ASSESSMENT_STATUS = {
  CHO_THAM_DINH: 'Chờ thẩm định',
  DA_DUYET: 'Đã duyệt',
  TU_CHOI: 'Từ chối',
};

export const ASSESSMENT_STATUS_TEXT = {
  'Chờ thẩm định': 'Chờ thẩm định',
  'Đã duyệt': 'Đã duyệt',
  'Từ chối': 'Từ chối',
};

export const ASSESSMENT_STATUS_COLOR = {
  'Chờ thẩm định': 'warning',
  'Đã duyệt': 'success',
  'Từ chối': 'error',
};

// Risk Levels
export const RISK_LEVEL = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
};

export const RISK_LEVEL_TEXT = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
};

export const RISK_LEVEL_COLOR = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'error',
};

// ============================================
// DROPDOWN OPTIONS (for EnumSelect component)
// ============================================

// Contract Status Dropdown (Database values)
export const CONTRACT_STATUS_OPTIONS = {
  'Hiệu lực': 'Hiệu lực',
  'Hết hạn': 'Hết hạn',
  'Huỷ': 'Huỷ',
};

// Payment Method Dropdown (Database values)
export const PAYMENT_METHOD_OPTIONS = {
  'Tiền mặt': 'Tiền mặt',
  'Chuyển khoản': 'Chuyển khoản',
  'Thẻ': 'Thẻ',
};

// Transaction Type Dropdown
export const TRANSACTION_TYPE_OPTIONS = {
  'THANH_TOAN': 'Thanh toán',
  'HOAN_PHI': 'Hoàn phí',
};

// Risk Level Dropdown
export const RISK_LEVEL_OPTIONS = {
  'LOW': 'Thấp',
  'MEDIUM': 'Trung bình',
  'HIGH': 'Cao',
};

// Assessment Status Dropdown
export const ASSESSMENT_STATUS_OPTIONS = {
  'Chờ thẩm định': 'Chờ thẩm định',
  'Đã duyệt': 'Đã duyệt',
  'Từ chối': 'Từ chối',
};

// User Role Dropdown
export const USER_ROLE_OPTIONS = {
  'Admin': 'Admin',
  'Nhân viên': 'Nhân viên',
  'Kế toán': 'Kế toán',
  'Thẩm định': 'Thẩm định',
};

// Relation Type Dropdown (HopDongRelation)
export const RELATION_TYPE_OPTIONS = {
  'TAI_TUC': 'Tái tục',
  'CHUYEN_QUYEN': 'Chuyển quyền',
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
  // Email - RFC 5322 basic pattern
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Phone - Vietnam format (0xxxxxxxxx or +84xxxxxxxxx)
  phone: /^(0|\+84)[0-9]{9,10}$/,
  
  // ID Card - CMND 9 digits or CCCD 12 digits
  idCard: /^[0-9]{9,12}$/,
  
  // License Plate - Vietnam format (29A-12345) - DEPRECATED: No validation needed
  licensePlate: /^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/,
  
  // VIN - ISO 3779: 17 chars, no I/O/Q
  vin: /^[A-HJ-NPR-Z0-9]{17}$/i,
  
  // Engine Number - 6-30 alphanumeric
  engineNumber: /^[A-Z0-9]{6,30}$/i,
  
  // Full Name - Vietnamese letters with diacritics + spaces
  fullName: /^[a-zA-ZÀ-ỹ\s]{2,100}$/,
  
  // Address - Vietnamese text with numbers, punctuation
  address: /^[a-zA-Z0-9À-ỹ\s,.\-/]{10,500}$/,
  
  // ============================================
  // DEPRECATED: User/Account validation (Demo mode - no strict validation)
  // ============================================
  
  // Username - alphanumeric + underscore (DEPRECATED: Demo mode)
  username: /^[a-zA-Z0-9_]{5,50}$/,
  
  // Password - min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char (DEPRECATED: Demo mode)
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
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
  TRANSACTION_TYPE, // ⭐ NEW
  TRANSACTION_TYPE_TEXT, // ⭐ NEW
  ASSESSMENT_STATUS, // ⭐ NEW
  ASSESSMENT_STATUS_TEXT, // ⭐ NEW
  ASSESSMENT_STATUS_COLOR, // ⭐ NEW
  RISK_LEVEL, // ⭐ NEW
  RISK_LEVEL_TEXT, // ⭐ NEW
  RISK_LEVEL_COLOR, // ⭐ NEW
  CONTRACT_STATUS_OPTIONS, // ⭐ Dropdown
  PAYMENT_METHOD_OPTIONS, // ⭐ Dropdown
  TRANSACTION_TYPE_OPTIONS, // ⭐ Dropdown
  RISK_LEVEL_OPTIONS, // ⭐ Dropdown
  ASSESSMENT_STATUS_OPTIONS, // ⭐ Dropdown
  USER_ROLE_OPTIONS, // ⭐ Dropdown
  RELATION_TYPE_OPTIONS, // ⭐ Dropdown
  USER_ROLES,
  STORAGE_KEYS,
  MESSAGES,
  ERROR_MESSAGES,
  UI_COMMON,
  FILE_UPLOAD,
  REGEX,
};

export default config;