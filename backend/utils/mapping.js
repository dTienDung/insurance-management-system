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
  'card': 'Thẻ',
  'online': 'Thanh toán online'
};

const paymentMethodFromDB = {
  'Tiền mặt': 'cash',
  'Chuyển khoản': 'transfer',
  'Thẻ': 'card',
  'Thanh toán online': 'online'
};

// ============================================
// RISK LEVEL MAPPING
// ============================================
const riskLevelToDB = {
  'low': 'LOW',
  'medium': 'MEDIUM',
  'high': 'HIGH',
  'reject': 'REJECT'
};

const riskLevelFromDB = {
  'LOW': 'low',
  'MEDIUM': 'medium',
  'HIGH': 'high',
  'REJECT': 'reject'
};

// ============================================
// ASSESSMENT STATUS MAPPING
// ============================================
const assessmentStatusToDB = {
  'pending': 'Chờ thẩm định',
  'approved': 'Đã duyệt',
  'rejected': 'Từ chối'
};

const assessmentStatusFromDB = {
  'Chờ thẩm định': 'pending',
  'Đã duyệt': 'approved',
  'Từ chối': 'rejected'
};

// ============================================
// TRANSACTION TYPE MAPPING
// ============================================
const transactionTypeToDB = {
  'payment': 'Thanh toán',
  'refund': 'Hoàn tiền',
  'partial_payment': 'Thanh toán một phần'
};

const transactionTypeFromDB = {
  'Thanh toán': 'payment',
  'Hoàn tiền': 'refund',
  'Thanh toán một phần': 'partial_payment'
};

// ============================================
// CONTRACT STATUS MAPPING
// ============================================
const contractStatusToDB = {
  'draft': 'DRAFT',
  'pending_payment': 'PENDING_PAYMENT',
  'active': 'ACTIVE',
  'expired': 'EXPIRED',
  'cancelled': 'CANCELLED',
  'terminated': 'TERMINATED',
  'renewed': 'RENEWED',
  // Legacy support
  'hiệu lực': 'ACTIVE',
  'hết hạn': 'EXPIRED',
  'đã hủy': 'CANCELLED'
};

const contractStatusFromDB = {
  'DRAFT': 'draft',
  'PENDING_PAYMENT': 'pending_payment',
  'ACTIVE': 'active',
  'EXPIRED': 'expired',
  'CANCELLED': 'cancelled',
  'TERMINATED': 'terminated',
  'RENEWED': 'renewed',
  // Legacy support
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
  'contract_number': 'SoHD',
  'start_date': 'NgayKy',
  'end_date': 'NgayHetHan',
  'status': 'TrangThai',
  'premium_amount': 'PhiBaoHiem',
  'customer_id': 'MaKH',
  'vehicle_id': 'MaXe',
  'insurance_package_id': 'MaGoi',
  'employee_id': 'MaNV',
  'created_at': 'NgayTao',
  
  // Payment fields (ThanhToanHopDong)
  'payment_id': 'MaTT',
  'transaction_type': 'LoaiGiaoDich',
  'amount': 'SoTien',
  'payment_method': 'HinhThucThanhToan',
  'payment_date': 'NgayGiaoDich',
  'notes': 'GhiChu',
  
  // Customer fields
  'full_name': 'HoTen',
  'id_number': 'CMND_CCCD',
  'date_of_birth': 'NgaySinh',
  'address': 'DiaChi',
  'phone': 'SDT',
  'email': 'Email',
  
  // Vehicle fields (Xe table - NO BienSo!)
  'vehicle_type': 'LoaiXe',
  'manufacturer': 'HangXe',
  'model': 'Model',
  'manufacturing_year': 'NamSX',
  'engine_number': 'SoMay',
  'chassis_number': 'SoKhung_VIN', // ← Database dùng SoKhung_VIN
  'vin': 'SoKhung_VIN', // Alias cho VIN
  'value': 'GiaTriXe',
  
  // License plate fields (BienSoXe table)
  'license_plate_id': 'MaBienSo',
  'license_plate': 'BienSo',
  'plate_status': 'TrangThai',
  
  // Assessment fields (HoSoThamDinh)
  'assessment_id': 'MaHS',
  'risk_level': 'RiskLevel',
  'assessment_result': 'KetQua',
  'assessment_date': 'NgayThamDinh',
  
  // Insurance package fields (GoiBaoHiem)
  'package_id': 'MaGoi',
  'package_name': 'TenGoi',
  'package_description': 'MoTaGoiBaoHiem'
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Map contract data từ API format sang DB format
 */
const mapContractToDB = (contract) => {
  return {
    MaHD: contract.contract_id,
    SoHD: contract.contract_number,
    NgayKy: contract.start_date,
    NgayHetHan: contract.end_date,
    TrangThai: contractStatusToDB[contract.status] || contract.status,
    PhiBaoHiem: contract.premium_amount,
    MaKH: contract.customer_id,
    MaXe: contract.vehicle_id,
    MaGoi: contract.insurance_package_id,
    MaNV: contract.employee_id,
    NgayTao: contract.created_at
  };
};

/**
 * Map contract data từ DB format sang API format
 */
const mapContractFromDB = (dbContract) => {
  return {
    contract_id: dbContract.MaHD,
    contract_number: dbContract.SoHD,
    start_date: dbContract.NgayKy,
    end_date: dbContract.NgayHetHan,
    status: contractStatusFromDB[dbContract.TrangThai] || dbContract.TrangThai,
    premium_amount: parseFloat(dbContract.PhiBaoHiem || 0),
    customer_id: dbContract.MaKH,
    vehicle_id: dbContract.MaXe,
    insurance_package_id: dbContract.MaGoi,
    employee_id: dbContract.MaNV,
    created_at: dbContract.NgayTao
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
    license_plate: dbVehicle.BienSo, // From JOIN with BienSoXe
    vehicle_type: dbVehicle.LoaiXe,
    manufacturer: dbVehicle.HangXe,
    model: dbVehicle.Model,
    manufacturing_year: dbVehicle.NamSX,
    engine_number: dbVehicle.SoMay,
    chassis_number: dbVehicle.SoKhung,
    value: parseFloat(dbVehicle.GiaTriXe || 0)
  };
};

/**
 * Map payment data từ DB format sang API format
 */
const mapPaymentFromDB = (dbPayment) => {
  return {
    payment_id: dbPayment.MaTT,
    contract_id: dbPayment.MaHD,
    transaction_type: transactionTypeFromDB[dbPayment.LoaiGiaoDich] || dbPayment.LoaiGiaoDich,
    amount: parseFloat(dbPayment.SoTien || 0),
    payment_method: paymentMethodFromDB[dbPayment.HinhThucThanhToan] || dbPayment.HinhThucThanhToan,
    payment_date: dbPayment.NgayGiaoDich,
    notes: dbPayment.GhiChu
  };
};

/**
 * Map assessment data từ DB format sang API format
 */
const mapAssessmentFromDB = (dbAssessment) => {
  return {
    assessment_id: dbAssessment.MaHS,
    contract_id: dbAssessment.MaHD,
    vehicle_id: dbAssessment.MaXe,
    risk_level: riskLevelFromDB[dbAssessment.RiskLevel] || dbAssessment.RiskLevel,
    result: assessmentStatusFromDB[dbAssessment.KetQua] || dbAssessment.KetQua,
    assessment_date: dbAssessment.NgayThamDinh,
    assessor_id: dbAssessment.MaNV_ThamDinh
  };
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  // Status mappings
  paymentStatusToDB,
  paymentStatusFromDB,
  paymentMethodToDB,
  paymentMethodFromDB,
  contractStatusToDB,
  contractStatusFromDB,
  riskLevelToDB,
  riskLevelFromDB,
  assessmentStatusToDB,
  assessmentStatusFromDB,
  transactionTypeToDB,
  transactionTypeFromDB,
  
  // Column mapping
  columnMapping,
  
  // Helper functions
  mapContractToDB,
  mapContractFromDB,
  mapCustomerFromDB,
  mapVehicleFromDB,
  mapPaymentFromDB,
  mapAssessmentFromDB
};