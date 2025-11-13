// ============================================
// AUTO CODE HELPER
// Hướng dẫn làm việc với Database Trigger tự động sinh mã
// ============================================

/**
 * ⚠️ LƯU Ý QUAN TRỌNG VỀ SINH MÃ TỰ ĐỘNG
 * 
 * Database đã có TRIGGER tự động sinh mã cho:
 * - KhachHang: KH001, KH002, KH003...
 * - Xe: XE001, XE002, XE003...
 * - HopDong: HD00000001, HD00000002...
 * - HoSoThamDinh: HS001, HS002...
 * 
 * WORKFLOW ĐÚNG:
 * 
 * 1. Frontend KHÔNG cần:
 *    - Gọi API để lấy mã mới trước
 *    - Hiển thị mã trong form
 *    - Gửi mã trong payload
 * 
 * 2. Frontend CHỈ CẦN:
 *    - Để field Mã = NULL hoặc bỏ qua không gửi
 *    - Submit form với các field khác (HoTen, CMND_CCCD, SDT...)
 *    - Backend sẽ INSERT với MaKH = NULL
 *    - Trigger tự động sinh mã và điền vào
 * 
 * 3. Sau khi tạo thành công:
 *    - API trả về object mới kèm mã đã sinh
 *    - Frontend hiển thị thông báo: "Đã tạo khách hàng KH026"
 * 
 * VÍ DỤ CODE:
 * 
 * // ❌ SAI - Không làm thế này
 * const newCode = await customerAPI.getNewCode(); // API này không tồn tại
 * const payload = { MaKH: newCode, HoTen: 'Nguyễn Văn A', ... };
 * 
 * // ✅ ĐÚNG - Làm thế này
 * const payload = {
 *   // MaKH: KHÔNG GỮI hoặc gửi NULL
 *   HoTen: 'Nguyễn Văn A',
 *   CMND_CCCD: '001234567890',
 *   SDT: '0987654321',
 * };
 * const result = await customerAPI.create(payload);
 * console.log('Đã tạo:', result.data.MaKH); // Mã do database sinh
 */

/**
 * Prepare payload cho API create
 * Loại bỏ các field mã (để trigger tự sinh)
 * 
 * @param {Object} formData - Dữ liệu từ form
 * @param {String} codeField - Tên field mã (VD: 'MaKH', 'MaXe')
 * @returns {Object} Payload đã clean
 */
export const prepareCreatePayload = (formData, codeField) => {
  const payload = { ...formData };
  
  // Xóa field mã khỏi payload
  delete payload[codeField];
  
  return payload;
};

/**
 * Hiển thị thông báo sau khi tạo thành công
 * 
 * @param {String} entityName - Tên đối tượng (VD: 'Khách hàng', 'Xe')
 * @param {String} code - Mã đã được sinh (VD: 'KH026')
 */
export const showCreatedMessage = (entityName, code) => {
  return `Đã tạo ${entityName} mới: ${code}`;
};

/**
 * Template form data cho Customer (KHÔNG bao gồm MaKH)
 */
export const getCustomerFormTemplate = () => ({
  // MaKH: KHÔNG có trong template
  HoTen: '',
  CMND_CCCD: '',
  NgaySinh: null,
  DiaChi: '',
  SDT: '',
  Email: '',
});

/**
 * Template form data cho Vehicle (KHÔNG bao gồm MaXe)
 */
export const getVehicleFormTemplate = () => ({
  // MaXe: KHÔNG có
  HangXe: '',
  DongXe: '',
  NamSanXuat: new Date().getFullYear(),
  SoKhung: '',
  SoMay: '',
  LoaiXe: '',
  GiaTriXe: 0,
  MucDichSuDung: '',
  TinhTrangKyThuat: '',
  MaKH: '', // Required để link với khách
});

/**
 * Template form data cho Contract (KHÔNG bao gồm MaHD)
 */
export const getContractFormTemplate = () => ({
  // MaHD: KHÔNG có
  MaKH: '',
  MaXe: '',
  MaGoi: '',
  NgayBatDau: null,
  NgayKetThuc: null,
  SoTienBaoHiem: 0,
  PhiBaoHiem: 0,
  MaNV: '',
});

const autoCodeHelper = {
  prepareCreatePayload,
  showCreatedMessage,
  getCustomerFormTemplate,
  getVehicleFormTemplate,
  getContractFormTemplate,
};

export default autoCodeHelper;
