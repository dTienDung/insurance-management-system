// ============================================
// PJICO - Backend Constants
// Tổng Công ty Bảo hiểm Petrolimex
// ============================================

// Company Information
const COMPANY = {
  name: 'PJICO',
  shortName: 'PJICO',
  fullName: 'Tổng Công ty Bảo hiểm Petrolimex',
  englishName: 'Petrolimex Insurance Corporation',
  
  // Contact
  website: '',
  email: 'info@pjico.com.vn',
  hotline: '1900 5555 15',
  
  // Address
  address: {
    main: 'Tầng 8, Tòa nhà Petrovietnam, 1-5 Lê Duẩn, Quận 1, TP.HCM',
    street: '1-5 Lê Duẩn',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    country: 'Việt Nam',
  },
  
  // Business
  taxCode: '0123456789',
  establishedYear: 1996,
};

// Application Information
const APP = {
  name: 'PJICO API',
  fullName: 'Hệ thống Quản lý Bảo hiểm PJICO - Backend API',
  version: '1.0.0',
  description: 'Backend API cho hệ thống quản lý hợp đồng bảo hiểm xe cơ giới',
  copyright: `© ${new Date().getFullYear()} PJICO - Tổng Công ty Bảo hiểm Petrolimex`,
};

// API Configuration
const API = {
  port: process.env.PORT || 5000,
  environment: process.env.NODE_ENV || 'development',
  prefix: '/api',
};

// JWT Configuration
const JWT = {
  secret: process.env.JWT_SECRET || 'pjico-secret-key',
  expiresIn: '24h',
  refreshExpiresIn: '7d',
};

// Database Configuration
const DB = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'QuanlyHDBaoHiem',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
};

// Messages - Tiếng Việt
const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Đăng nhập thành công',
    LOGOUT: 'Đăng xuất thành công',
    CREATE: 'Tạo mới thành công',
    UPDATE: 'Cập nhật thành công',
    DELETE: 'Xóa thành công',
    SAVE: 'Lưu thành công',
  },
  ERROR: {
    LOGIN: 'Đăng nhập thất bại',
    INVALID_CREDENTIALS: 'Tên đăng nhập hoặc mật khẩu không đúng',
    UNAUTHORIZED: 'Không có quyền truy cập',
    NOT_FOUND: 'Không tìm thấy dữ liệu',
    DUPLICATE: 'Dữ liệu đã tồn tại',
    VALIDATION: 'Dữ liệu không hợp lệ',
    SERVER: 'Lỗi server nội bộ',
    DATABASE: 'Lỗi kết nối cơ sở dữ liệu',
  },
};

// Status Codes
const STATUS = {
  CONTRACT: {
    DRAFT: 'DRAFT',
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    ACTIVE: 'ACTIVE',
    EXPIRED: 'EXPIRED',
    CANCELLED: 'CANCELLED',
    TERMINATED: 'TERMINATED',
    RENEWED: 'RENEWED',
    // Legacy support
    ACTIVE_VN: 'Hiệu lực',
    EXPIRED_VN: 'Hết hạn',
    CANCELLED_VN: 'Đã hủy',
  },
  
  PAYMENT: {
    PAID: 'paid',
    UNPAID: 'unpaid',
    PARTIAL: 'partial',
  },
  
  TRANSACTION_TYPE: {
    PAYMENT: 'Thanh toán',
    REFUND: 'Hoàn tiền',
    PARTIAL_PAYMENT: 'Thanh toán một phần',
  },
  
  PAYMENT_METHOD: {
    CASH: 'Tiền mặt',
    TRANSFER: 'Chuyển khoản',
    CARD: 'Thẻ',
    ONLINE: 'Thanh toán online',
  },
  
  ASSESSMENT: {
    PENDING: 'Chờ thẩm định',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
  },
  
  RISK_LEVEL: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    REJECT: 'REJECT',
  },
  
  LICENSE_PLATE: {
    ACTIVE: 'Đang sử dụng',
    TRANSFERRED: 'Đã chuyển nhượng',
    CANCELLED: 'Đã hủy',
  },
  
  VEHICLE_OWNERSHIP: {
    CURRENT: 'current',
    PREVIOUS: 'previous',
  },
};

// Export
module.exports = {
  COMPANY,
  APP,
  API,
  JWT,
  DB,
  MESSAGES,
  STATUS,
};
