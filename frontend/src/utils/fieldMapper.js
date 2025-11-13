// ============================================
// FIELD MAPPING HELPER
// Map giữa Frontend fields ↔ Backend fields
// ============================================

/**
 * Map tên field từ Frontend → Backend (API Request)
 * 
 * VÍ DỤ:
 * Frontend form có: { hoTen: "A", cccd: "123" }
 * → Backend cần: { HoTen: "A", CCCD: "123" }
 */
export const mapFieldsToBackend = (data, entityType) => {
  const mappings = {
    customer: {
      hoTen: 'HoTen',
      cccd: 'CMND_CCCD',
      ngaySinh: 'NgaySinh',
      diaChi: 'DiaChi',
      sdt: 'SDT',
      email: 'Email',
    },
    vehicle: {
      hangXe: 'HangXe',
      dongXe: 'DongXe',
      namSanXuat: 'NamSanXuat',
      soKhung: 'SoKhung_VIN', // ← Database dùng SoKhung_VIN
      chassis_number: 'SoKhung_VIN', // Alias
      vin: 'SoKhung_VIN', // Alias
      soMay: 'SoMay',
      engine_number: 'SoMay', // Alias
      loaiXe: 'LoaiXe',
      giaTriXe: 'GiaTriXe',
      mucDichSuDung: 'MucDichSuDung',
      tinhTrangKyThuat: 'TinhTrangKyThuat',
      maKH: 'MaKH',
    },
    contract: {
      maKH: 'MaKH',
      maXe: 'MaXe',
      maGoi: 'MaGoi', // ⭐ NEW - không phải maLB
      ngayBatDau: 'NgayBatDau',
      ngayKetThuc: 'NgayKetThuc',
      soTienBaoHiem: 'SoTienBaoHiem',
      phiBaoHiem: 'PhiBaoHiem',
      maNV: 'MaNV',
    },
    payment: {
      maHD: 'MaHD',
      soTien: 'SoTien',
      ngayThanhToan: 'NgayThanhToan',
      phuongThucThanhToan: 'PhuongThucThanhToan',
      loaiGiaoDich: 'LoaiGiaoDich',
      ghiChu: 'GhiChu',
    },
  };

  const mapping = mappings[entityType];
  if (!mapping) return data;

  const mapped = {};
  Object.keys(data).forEach((key) => {
    const backendKey = mapping[key] || key;
    mapped[backendKey] = data[key];
  });

  return mapped;
};

/**
 * Map tên field từ Backend → Frontend (API Response)
 * 
 * VÍ DỤ:
 * Backend trả về: { HoTen: "A", CCCD: "123" }
 * → Frontend cần: { hoTen: "A", cccd: "123" }
 */
export const mapFieldsFromBackend = (data, entityType) => {
  const mappings = {
    customer: {
      HoTen: 'hoTen',
      CCCD: 'cccd',
      NgaySinh: 'ngaySinh',
      DiaChi: 'diaChi',
      SDT: 'sdt',
      Email: 'email',
    },
    vehicle: {
      HangXe: 'hangXe',
      DongXe: 'dongXe',
      NamSanXuat: 'namSanXuat',
      SoKhung: 'soKhung',
      SoMay: 'soMay',
      LoaiXe: 'loaiXe',
      GiaTriXe: 'giaTriXe',
      MucDichSuDung: 'mucDichSuDung',
      TinhTrangKyThuat: 'tinhTrangKyThuat',
      MaKH: 'maKH',
    },
    contract: {
      MaKH: 'maKH',
      MaXe: 'maXe',
      MaGoi: 'maGoi', // ⭐ NEW
      NgayBatDau: 'ngayBatDau',
      NgayKetThuc: 'ngayKetThuc',
      SoTienBaoHiem: 'soTienBaoHiem',
      PhiBaoHiem: 'phiBaoHiem',
      TrangThai: 'trangThai',
    },
    payment: {
      MaTT: 'maTT',
      MaHD: 'maHD',
      SoTien: 'soTien',
      NgayThanhToan: 'ngayThanhToan',
      PhuongThucThanhToan: 'phuongThucThanhToan',
      LoaiGiaoDich: 'loaiGiaoDich',
      TrangThai: 'trangThai',
      GhiChu: 'ghiChu',
    },
  };

  const mapping = mappings[entityType];
  if (!mapping) return data;

  const mapped = {};
  Object.keys(data).forEach((key) => {
    const frontendKey = mapping[key] || key;
    mapped[frontendKey] = data[key];
  });

  return mapped;
};

/**
 * Map status từ Backend → Frontend display text
 */
export const mapStatus = (status, type) => {
  const statusMaps = {
    contract: {
      'DRAFT': 'Khởi tạo',
      'PENDING_PAYMENT': 'Chờ thanh toán',
      'ACTIVE': 'Đang hiệu lực',
      'EXPIRED': 'Hết hạn',
      'CANCELLED': 'Đã hủy',
      'TERMINATED': 'Chấm dứt',
      'RENEWED': 'Đã tái tục',
    },
    payment: {
      'Thành công': 'Thành công',
      'Thất bại': 'Thất bại',
      'Chờ xử lý': 'Chờ xử lý',
      'Hoàn trả': 'Hoàn trả',
    },
    assessment: {
      'Chờ thẩm định': 'Chờ thẩm định',
      'Đã duyệt': 'Đã duyệt',
      'Từ chối': 'Từ chối',
    },
    riskLevel: {
      'LOW': 'Thấp',
      'MEDIUM': 'Trung bình',
      'HIGH': 'Cao',
    },
  };

  return statusMaps[type]?.[status] || status;
};

/**
 * Map status color cho Chip component
 */
export const getStatusColor = (status, type) => {
  const colorMaps = {
    contract: {
      'DRAFT': 'default',
      'PENDING_PAYMENT': 'warning',
      'ACTIVE': 'success',
      'EXPIRED': 'error',
      'CANCELLED': 'error',
      'TERMINATED': 'error',
      'RENEWED': 'info',
    },
    payment: {
      'Thành công': 'success',
      'Thất bại': 'error',
      'Chờ xử lý': 'warning',
      'Hoàn trả': 'info',
    },
    assessment: {
      'Chờ thẩm định': 'warning',
      'Đã duyệt': 'success',
      'Từ chối': 'error',
    },
    riskLevel: {
      'LOW': 'success',
      'MEDIUM': 'warning',
      'HIGH': 'error',
    },
  };

  return colorMaps[type]?.[status] || 'default';
};

const fieldMapper = {
  mapFieldsToBackend,
  mapFieldsFromBackend,
  mapStatus,
  getStatusColor,
};

export default fieldMapper;
