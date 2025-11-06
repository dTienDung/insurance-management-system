// backend/utils/mapping.js

/**
 * Mapping giữa API (tiếng Anh) và Database (tiếng Việt)
 */

// ============================================
// PAYMENT STATUS MAPPING
// ============================================
const paymentStatusToDB = {
  'paid': 'Đã thanh toán',
  'unpaid': 'Chưa thanh toán'
};

const paymentStatusFromDB = {
  'Đã thanh toán': 'paid',
  'Chưa thanh toán': 'unpaid'
};

// ============================================
// PAYMENT METHOD MAPPING
// ============================================
const paymentMethodToDB = {
  'cash': 'Tiền mặt',
  'transfer': 'Chuyển khoản',
  'card': 'Thẻ'
};

const paymentMethodFromDB = {
  'Tiền mặt': 'cash',
  'Chuyển khoản': 'transfer',
  'Thẻ': 'card'
};

// ============================================
// CONTRACT STATUS MAPPING
// ============================================
const contractStatusToDB = {
  'active': 'Hiệu lực',
  'expired': 'Hết hạn',
  'cancelled': 'Đã hủy'
};

const contractStatusFromDB = {
  'Hiệu lực': 'active',
  'Hết hạn': 'expired',
  'Đã hủy': 'cancelled'
};

// ============================================
// COLUMN NAME MAPPING
// ============================================
const columnMapping = {
  // Contract fields
  'contract_id': 'MaHD',
  'contract_number': 'MaHD',
  'start_date': 'NgayKy',
  'end_date': 'NgayHetHan',
  'status': 'TrangThai',
  'premium_amount': 'PhiBaoHiem',
  'customer_id': 'MaKH',
  'vehicle_id': 'MaXe',
  'insurance_type_id': 'MaLB',
  'employee_id': 'MaNV',
  'created_at': 'NgayTao',
  
  // Payment fields
  'payment_status': 'TrangThaiThanhToan',
  'payment_date': 'NgayThanhToan',
  'payment_method': 'HinhThucThanhToan',
  'payment_notes': 'GhiChuThanhToan',
  
  // Customer fields
  'full_name': 'HoTen',
  'id_number': 'CMND_CCCD',
  'date_of_birth': 'NgaySinh',
  'address': 'DiaChi',
  'phone': 'SDT',
  'email': 'Email',
  
  // Vehicle fields
  'license_plate': 'BienSoXe',
  'vehicle_type': 'LoaiXe',
  'manufacturer': 'HangXe',
  'model': 'Model',
  'manufacturing_year': 'NamSanXuat',
  'engine_number': 'SoMay',
  'chassis_number': 'SoKhung'
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Map contract data từ API format sang DB format
 */
const mapContractToDB = (contract) => {
  return {
    MaHD: contract.contract_id || contract.contract_number,
    NgayKy: contract.start_date,
    NgayHetHan: contract.end_date,
    TrangThai: contractStatusToDB[contract.status] || contract.status,
    PhiBaoHiem: contract.premium_amount,
    MaKH: contract.customer_id,
    MaXe: contract.vehicle_id,
    MaLB: contract.insurance_type_id,
    MaNV: contract.employee_id,
    TrangThaiThanhToan: paymentStatusToDB[contract.payment_status] || 'Chưa thanh toán',
    NgayThanhToan: contract.payment_date || null,
    HinhThucThanhToan: contract.payment_method ? paymentMethodToDB[contract.payment_method] : null,
    GhiChuThanhToan: contract.payment_notes || null
  };
};

/**
 * Map contract data từ DB format sang API format
 */
const mapContractFromDB = (dbContract) => {
  return {
    contract_id: dbContract.MaHD,
    contract_number: dbContract.MaHD,
    start_date: dbContract.NgayKy,
    end_date: dbContract.NgayHetHan,
    status: contractStatusFromDB[dbContract.TrangThai] || 'active',
    premium_amount: parseFloat(dbContract.PhiBaoHiem || 0),
    customer_id: dbContract.MaKH,
    vehicle_id: dbContract.MaXe,
    insurance_type_id: dbContract.MaLB,
    employee_id: dbContract.MaNV,
    created_at: dbContract.NgayTao,
    payment_status: paymentStatusFromDB[dbContract.TrangThaiThanhToan] || 'unpaid',
    payment_date: dbContract.NgayThanhToan,
    payment_method: dbContract.HinhThucThanhToan ? paymentMethodFromDB[dbContract.HinhThucThanhToan] : null,
    payment_notes: dbContract.GhiChuThanhToan
  };
};

/**
 * Map customer data từ DB format sang API format
 */
const mapCustomerFromDB = (dbCustomer) => {
  return {
    customer_id: dbCustomer.MaKH,
    full_name: dbCustomer.HoTen,
    id_number: dbCustomer.CMND_CCCD,
    date_of_birth: dbCustomer.NgaySinh,
    address: dbCustomer.DiaChi,
    phone: dbCustomer.SDT,
    email: dbCustomer.Email
  };
};

/**
 * Map vehicle data từ DB format sang API format
 */
const mapVehicleFromDB = (dbVehicle) => {
  return {
    vehicle_id: dbVehicle.MaXe,
    license_plate: dbVehicle.BienSoXe,
    vehicle_type: dbVehicle.LoaiXe,
    manufacturer: dbVehicle.HangXe,
    model: dbVehicle.Model,
    manufacturing_year: dbVehicle.NamSanXuat,
    engine_number: dbVehicle.SoMay,
    chassis_number: dbVehicle.SoKhung
  };
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  // Mapping objects
  paymentStatusToDB,
  paymentStatusFromDB,
  paymentMethodToDB,
  paymentMethodFromDB,
  contractStatusToDB,
  contractStatusFromDB,
  columnMapping,
  
  // Helper functions
  mapContractToDB,
  mapContractFromDB,
  mapCustomerFromDB,
  mapVehicleFromDB
};