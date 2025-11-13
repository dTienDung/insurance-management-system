// ============================================
// VALIDATION HELPER
// Validate form data trước khi submit
// ============================================

import { REGEX } from '../config';

/**
 * Validate Customer form
 */
export const validateCustomer = (data) => {
  const errors = {};

  // Full Name - required, Vietnamese letters only
  if (!data.hoTen?.trim()) {
    errors.hoTen = 'Vui lòng nhập họ tên';
  } else if (!REGEX.fullName.test(data.hoTen.trim())) {
    errors.hoTen = 'Họ tên chỉ được chứa chữ cái (2-100 ký tự)';
  }

  // ID Card - required, 9-12 digits
  if (!data.cccd?.trim()) {
    errors.cccd = 'Vui lòng nhập CCCD';
  } else if (!REGEX.idCard.test(data.cccd)) {
    errors.cccd = 'CCCD không hợp lệ (9-12 chữ số)';
  }

  // Phone - required, Vietnam format
  if (!data.sdt?.trim()) {
    errors.sdt = 'Vui lòng nhập số điện thoại';
  } else if (!REGEX.phone.test(data.sdt)) {
    errors.sdt = 'Số điện thoại không hợp lệ (VD: 0912345678)';
  }

  // Email - optional, but if provided must be valid
  if (data.email && !REGEX.email.test(data.email)) {
    errors.email = 'Email không hợp lệ';
  }

  // Address - optional, but if provided must be >= 10 chars
  if (data.diaChi && data.diaChi.trim().length > 0) {
    if (data.diaChi.trim().length < 10) {
      errors.diaChi = 'Địa chỉ phải có ít nhất 10 ký tự';
    } else if (!REGEX.address.test(data.diaChi)) {
      errors.diaChi = 'Địa chỉ chứa ký tự không hợp lệ';
    }
  }

  // Date of Birth - must be 18-100 years old
  if (data.ngaySinh) {
    const birthDate = new Date(data.ngaySinh);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ? age - 1
      : age;

    if (actualAge < 18) {
      errors.ngaySinh = 'Khách hàng phải đủ 18 tuổi';
    } else if (actualAge > 100) {
      errors.ngaySinh = 'Ngày sinh không hợp lệ';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Vehicle form
 */
export const validateVehicle = (data) => {
  const errors = {};

  // Brand
  if (!data.hangXe?.trim()) {
    errors.hangXe = 'Vui lòng nhập hãng xe';
  }

  // Model/Type
  if (!data.dongXe?.trim()) {
    errors.dongXe = 'Vui lòng nhập dòng xe';
  }

  // Manufacturing Year - Match DB constraint: 1990 to current year
  if (!data.namSanXuat) {
    errors.namSanXuat = 'Vui lòng nhập năm sản xuất';
  } else {
    const year = parseInt(data.namSanXuat);
    const currentYear = new Date().getFullYear();
    if (isNaN(year)) {
      errors.namSanXuat = 'Năm sản xuất phải là số';
    } else if (year < 1990 || year > currentYear) {
      errors.namSanXuat = `Năm sản xuất không hợp lệ (1990-${currentYear})`;
    }
  }

  // VIN (Chassis Number) - ISO 3779: 17 chars, no I/O/Q
  if (!data.soKhung?.trim() && !data.chassis_number?.trim()) {
    errors.soKhung = 'Vui lòng nhập số khung (VIN)';
  } else {
    const vin = (data.soKhung || data.chassis_number).trim().toUpperCase();
    if (!REGEX.vin.test(vin)) {
      errors.soKhung = 'VIN phải có đúng 17 ký tự (A-Z, 0-9, không chứa I/O/Q)';
    }
  }

  // Engine Number - 6-30 alphanumeric
  if (!data.soMay?.trim() && !data.engine_number?.trim()) {
    errors.soMay = 'Vui lòng nhập số máy';
  } else {
    const engineNo = (data.soMay || data.engine_number).trim().toUpperCase();
    if (!REGEX.engineNumber.test(engineNo)) {
      errors.soMay = 'Số máy phải có 6-30 ký tự (chữ và số)';
    }
  }

  // Customer ID
  if (!data.maKH) {
    errors.maKH = 'Vui lòng chọn khách hàng';
  }

  // Vehicle Value - optional, no min/max in DB constraint
  if (data.giaTriXe) {
    const value = parseFloat(data.giaTriXe);
    if (isNaN(value) || value <= 0) {
      errors.giaTriXe = 'Giá trị xe phải lớn hơn 0';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Contract form
 */
export const validateContract = (data) => {
  const errors = {};

  if (!data.maKH) {
    errors.maKH = 'Vui lòng chọn khách hàng';
  }

  if (!data.maXe) {
    errors.maXe = 'Vui lòng chọn xe';
  }

  if (!data.maGoi) {
    errors.maGoi = 'Vui lòng chọn gói bảo hiểm';
  }

  if (!data.ngayBatDau) {
    errors.ngayBatDau = 'Vui lòng chọn ngày bắt đầu';
  } else {
    // Check start date not too far in the past
    const startDate = new Date(data.ngayBatDau);
    const today = new Date();
    const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 30) {
      errors.ngayBatDau = 'Ngày bắt đầu không được quá 30 ngày trong quá khứ';
    }
  }

  if (!data.ngayKetThuc) {
    errors.ngayKetThuc = 'Vui lòng chọn ngày kết thúc';
  }

  // Validate date range
  if (data.ngayBatDau && data.ngayKetThuc) {
    const startDate = new Date(data.ngayBatDau);
    const endDate = new Date(data.ngayKetThuc);
    
    if (endDate <= startDate) {
      errors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu';
    } else {
      // Check contract duration <= 365 days
      const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
      if (daysDiff > 365) {
        errors.ngayKetThuc = 'Thời hạn hợp đồng không được vượt quá 365 ngày';
      } else if (daysDiff < 1) {
        errors.ngayKetThuc = 'Thời hạn hợp đồng tối thiểu 1 ngày';
      }
    }
  }

  // Insurance amount
  if (!data.soTienBaoHiem || data.soTienBaoHiem <= 0) {
    errors.soTienBaoHiem = 'Vui lòng nhập số tiền bảo hiểm';
  } else {
    const amount = parseFloat(data.soTienBaoHiem);
    if (amount < 5000000) {
      errors.soTienBaoHiem = 'Số tiền bảo hiểm tối thiểu 5 triệu VNĐ';
    } else if (amount > 1000000000) {
      errors.soTienBaoHiem = 'Số tiền bảo hiểm tối đa 1 tỷ VNĐ';
    }
  }

  // Premium fee
  if (!data.phiBaoHiem || data.phiBaoHiem <= 0) {
    errors.phiBaoHiem = 'Vui lòng nhập phí bảo hiểm';
  } else if (data.soTienBaoHiem && data.phiBaoHiem) {
    const amount = parseFloat(data.soTienBaoHiem);
    const premium = parseFloat(data.phiBaoHiem);
    
    // Premium should not exceed insurance amount
    if (premium > amount) {
      errors.phiBaoHiem = 'Phí bảo hiểm không được lớn hơn số tiền bảo hiểm';
    }
    
    // Premium should be 1-10% of insurance amount (reasonable range)
    const ratio = (premium / amount) * 100;
    if (ratio < 1) {
      errors.phiBaoHiem = 'Phí bảo hiểm quá thấp (< 1% số tiền bảo hiểm)';
    } else if (ratio > 10) {
      errors.phiBaoHiem = 'Phí bảo hiểm quá cao (> 10% số tiền bảo hiểm)';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Payment form
 * NOTE: Allows negative amounts for refunds (HOAN_PHI)
 */
export const validatePayment = (data) => {
  const errors = {};

  if (!data.maHD) {
    errors.maHD = 'Vui lòng chọn hợp đồng';
  }

  // Allow 0 and negative for refunds - no validation on amount
  if (data.soTien === undefined || data.soTien === null || data.soTien === '') {
    errors.soTien = 'Vui lòng nhập số tiền';
  }
  // NOTE: Removed amount checks to support refunds (negative amounts)

  if (!data.phuongThucThanhToan && !data.hinhThuc) {
    errors.phuongThucThanhToan = 'Vui lòng chọn phương thức thanh toán';
  }

  if (!data.ngayThanhToan && !data.ngayGiaoDich) {
    errors.ngayThanhToan = 'Vui lòng chọn ngày thanh toán';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate License Plate (Biển số xe)
 * NOTE: Simplified - no strict format validation (random/separate module)
 */
export const validateLicensePlate = (bienSo) => {
  if (!bienSo?.trim()) {
    return { isValid: false, error: 'Vui lòng nhập biển số' };
  }

  // No format validation - allow any non-empty string
  return { isValid: true, error: null };
};

const validationHelper = {
  validateCustomer,
  validateVehicle,
  validateContract,
  validatePayment,
  validateLicensePlate, // Kept for backward compatibility
};

export default validationHelper;
