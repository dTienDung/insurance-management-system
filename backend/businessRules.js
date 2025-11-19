/**
 * BUSINESS RULES MODULE
 * Chứa toàn bộ quy tắc nghiệp vụ theo rule.docx
 * 
 * Theo yêu cầu đồ án:
 * - Phân loại rủi ro (Risk Level)
 * - Validate thông tin xe (Vehicle)
 * - Validate hồ sơ thẩm định (Assessment)
 * - Validate hợp đồng (Contract)
 */

// ============================================
// RISK LEVEL RULES
// ============================================

/**
 * Phân loại mức độ rủi ro theo điểm
 * Rule: 
 * - 0-15: LOW
 * - 16-25: MEDIUM
 * - ≥26: HIGH
 */
function getRiskLevel(score) {
  if (score < 0) {
    throw new Error('Risk score cannot be negative');
  }
  
  if (score <= 15) {
    return 'LOW';
  }
  if (score <= 25) {
    return 'MEDIUM';
  }
  return 'HIGH';
}

/**
 * Tính điểm rủi ro dựa trên thông tin xe và lái xe
 * Rule theo ma trận thẩm định
 */
function calculateRiskScore(vehicle, driver) {
  let score = 0;
  const currentYear = new Date().getFullYear();
  
  // Tuổi xe (NamSX)
  const vehicleAge = currentYear - vehicle.namSX;
  if (vehicleAge > 15) {
    score += 6; // Giảm từ 8 → 6
  } else if (vehicleAge > 10) {
    score += 5; // Giảm từ 6 → 5
  } else if (vehicleAge > 5) {
    score += 3; // Giảm từ 4 → 3
  } else {
    score += 1;
  }
  
  // Loại xe
  if (vehicle.loaiXe === 'Truck' || vehicle.loaiXe === 'Bus') {
    score += 5; // Giảm từ 6 → 5
  } else if (vehicle.loaiXe === 'SUV') {
    score += 3; // Giảm từ 4 → 3
  } else {
    score += 2;
  }
  
  // Giá trị xe
  if (vehicle.giaTriXe > 1000000000) { // > 1 tỷ
    score += 2; // Giảm từ 3 → 2
  } else if (vehicle.giaTriXe < 200000000) { // < 200 triệu
    score += 4; // Giảm từ 5 → 4
  } else {
    score += 2;
  }
  
  // Tuổi lái xe
  if (driver.tuoi < 25) {
    score += 5; // Giảm từ 6 → 5
  } else if (driver.tuoi > 60) {
    score += 4; // Giảm từ 5 → 4
  } else {
    score += 1;
  }
  
  // Kinh nghiệm lái xe
  if (driver.namKinhNghiem < 2) {
    score += 6; // Giảm từ 7 → 6
  } else if (driver.namKinhNghiem < 5) {
    score += 3; // Giảm từ 4 → 3
  } else {
    score += 1;
  }
  
  // Lịch sử tai nạn
  score += driver.soVuTaiNan * 3; // Giảm từ 4 → 3
  
  return score;
}

// ============================================
// VEHICLE VALIDATION RULES
// ============================================

/**
 * Validate VIN (Vehicle Identification Number)
 * Rule: Phải đúng 17 ký tự, không có khoảng trắng
 */
function validateVIN(vin) {
  if (!vin || vin === null || vin === undefined) {
    throw new Error('VIN không được để trống');
  }
  
  const vinStr = String(vin).trim();
  
  if (vinStr.length === 0) {
    throw new Error('VIN không được để trống');
  }
  
  if (vinStr.includes(' ')) {
    throw new Error('VIN không được chứa khoảng trắng');
  }
  
  if (vinStr.length !== 17) {
    throw new Error('VIN phải có đúng 17 ký tự');
  }
  
  return true;
}

/**
 * Validate năm sản xuất
 * Rule: 1990 ≤ NamSX ≤ năm hiện tại
 */
function validateYear(year) {
  const currentYear = new Date().getFullYear();
  
  if (!year || year <= 0) {
    throw new Error('Năm sản xuất không hợp lệ');
  }
  
  if (year < 1990) {
    throw new Error('Năm sản xuất phải từ 1990 trở lên');
  }
  
  if (year > currentYear) {
    throw new Error('Năm sản xuất không được vượt quá năm hiện tại');
  }
  
  return true;
}

/**
 * Validate toàn bộ thông tin xe
 */
function validateVehicle(vehicle) {
  // Validate VIN
  validateVIN(vehicle.SoKhung_VIN);
  
  // Validate năm sản xuất
  validateYear(vehicle.NamSX);
  
  // Validate giá trị xe
  if (!vehicle.GiaTriXe || vehicle.GiaTriXe <= 0) {
    throw new Error('Giá trị xe phải lớn hơn 0');
  }
  
  // Validate loại xe
  const validTypes = ['Sedan', 'SUV', 'Truck', 'Bus', 'Van', 'Motorcycle'];
  if (!vehicle.LoaiXe || !validTypes.includes(vehicle.LoaiXe)) {
    throw new Error(`Loại xe không hợp lệ. Phải là một trong: ${validTypes.join(', ')}`);
  }
  
  return true;
}

// ============================================
// ASSESSMENT RULES (State Locking)
// ============================================

/**
 * Kiểm tra trạng thái hồ sơ có cho phép sửa/xóa không
 * Rule: Chỉ sửa/xóa được khi TrangThai = 'Chờ thẩm định'
 */
function canModifyAssessment(trangThai, maHD) {
  if (trangThai !== 'Chờ thẩm định') {
    throw new Error(`Chỉ có thể sửa hồ sơ đang chờ thẩm định. Trạng thái hiện tại: ${trangThai}`);
  }
  
  if (maHD) {
    throw new Error(`Hồ sơ đã được tạo hợp đồng (${maHD}), không thể chỉnh sửa`);
  }
  
  return true;
}

/**
 * Kiểm tra trạng thái hồ sơ có cho phép xóa không
 */
function canDeleteAssessment(trangThai, hasContract) {
  const finalStates = ['Chấp nhận', 'Từ chối', 'Đã thẩm định'];
  
  if (finalStates.includes(trangThai)) {
    throw new Error(`Không thể xóa hồ sơ đã được xử lý (Trạng thái: ${trangThai})`);
  }
  
  if (hasContract) {
    throw new Error('Không thể xóa hồ sơ đã có hợp đồng liên quan');
  }
  
  return true;
}

// ============================================
// CONTRACT VALIDATION RULES
// ============================================

/**
 * Validate format mã hợp đồng
 * Rule: HD-YYYYMMDD-XXXX
 */
function validateContractNumber(soHD) {
  const pattern = /^HD-\d{8}-\d{4}$/;
  
  if (!pattern.test(soHD)) {
    throw new Error('Số hợp đồng phải theo format HD-YYYYMMDD-XXXX');
  }
  
  return true;
}

/**
 * Validate thời hạn hợp đồng
 * Rule: NgayHetHan > NgayKy
 */
function validateContractPeriod(ngayKy, ngayHetHan) {
  const startDate = new Date(ngayKy);
  const endDate = new Date(ngayHetHan);
  
  if (endDate <= startDate) {
    throw new Error('Ngày hết hạn phải sau ngày ký hợp đồng');
  }
  
  const diffDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
  
  if (diffDays < 30) {
    throw new Error('Hợp đồng bảo hiểm phải có thời hạn tối thiểu 30 ngày');
  }
  
  if (diffDays > 730) { // 2 năm
    throw new Error('Hợp đồng bảo hiểm không được quá 2 năm');
  }
  
  return true;
}

/**
 * Validate phí bảo hiểm
 * Rule: PhiBaoHiem > 0
 */
function validatePremiumAmount(phiBaoHiem) {
  if (!phiBaoHiem || phiBaoHiem <= 0) {
    throw new Error('Phí bảo hiểm phải lớn hơn 0');
  }
  
  if (phiBaoHiem > 100000000) { // 100 triệu
    throw new Error('Phí bảo hiểm vượt quá giới hạn cho phép (100 triệu)');
  }
  
  return true;
}

// ============================================
// CUSTOMER VALIDATION RULES
// ============================================

/**
 * Validate CMND/CCCD
 * Rule: 9 hoặc 12 số
 */
function validateIDNumber(idNumber) {
  if (!idNumber) {
    throw new Error('Số CMND/CCCD không được để trống');
  }
  
  const cleaned = String(idNumber).replace(/\D/g, ''); // Loại bỏ ký tự không phải số
  
  if (cleaned.length !== 9 && cleaned.length !== 12) {
    throw new Error('Số CMND/CCCD phải có 9 hoặc 12 chữ số');
  }
  
  return true;
}

/**
 * Validate số điện thoại
 * Rule: 10 số, bắt đầu bằng 0
 */
function validatePhoneNumber(phone) {
  if (!phone) {
    throw new Error('Số điện thoại không được để trống');
  }
  
  const cleaned = String(phone).replace(/\D/g, '');
  
  if (cleaned.length !== 10) {
    throw new Error('Số điện thoại phải có 10 chữ số');
  }
  
  if (!cleaned.startsWith('0')) {
    throw new Error('Số điện thoại phải bắt đầu bằng số 0');
  }
  
  return true;
}

/**
 * Validate email
 */
function validateEmail(email) {
  if (!email) {
    return true; // Email có thể để trống
  }
  
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!pattern.test(email)) {
    throw new Error('Email không hợp lệ');
  }
  
  return true;
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Risk Level
  getRiskLevel,
  calculateRiskScore,
  
  // Vehicle Validation
  validateVIN,
  validateYear,
  validateVehicle,
  
  // Assessment Rules
  canModifyAssessment,
  canDeleteAssessment,
  
  // Contract Validation
  validateContractNumber,
  validateContractPeriod,
  validatePremiumAmount,
  
  // Customer Validation
  validateIDNumber,
  validatePhoneNumber,
  validateEmail
};
