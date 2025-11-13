// ============================================
// DATE HELPER
// Format dates cho display và API
// ============================================

/**
 * Format date cho hiển thị
 * @param {Date|string} date 
 * @param {boolean} includeTime 
 * @returns {string}
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (includeTime) {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  return `${day}/${month}/${year}`;
};

/**
 * Format date cho API (YYYY-MM-DD)
 * @param {Date|string} date 
 * @returns {string}
 */
export const formatDateForAPI = (date) => {
  if (!date) return null;
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Parse date string từ API
 * @param {string} dateString 
 * @returns {Date|null}
 */
export const parseDateFromAPI = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Tính số ngày giữa 2 ngày
 * @param {Date|string} startDate 
 * @param {Date|string} endDate 
 * @returns {number}
 */
export const daysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Kiểm tra hợp đồng sắp hết hạn (trong vòng N ngày)
 * @param {Date|string} endDate 
 * @param {number} daysThreshold 
 * @returns {boolean}
 */
export const isExpiringSoon = (endDate, daysThreshold = 15) => {
  const end = new Date(endDate);
  const today = new Date();
  
  if (isNaN(end.getTime())) return false;
  
  const daysLeft = daysBetween(today, end);
  return daysLeft <= daysThreshold && end > today;
};

/**
 * Kiểm tra đã hết hạn
 * @param {Date|string} endDate 
 * @returns {boolean}
 */
export const isExpired = (endDate) => {
  const end = new Date(endDate);
  const today = new Date();
  
  if (isNaN(end.getTime())) return false;
  
  return end < today;
};

/**
 * Tính ngày kết thúc dựa trên ngày bắt đầu + số tháng
 * @param {Date|string} startDate 
 * @param {number} months 
 * @returns {Date}
 */
export const calculateEndDate = (startDate, months = 12) => {
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return null;
  
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);
  
  return end;
};

/**
 * Format số tiền VNĐ
 * @param {number} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
};

/**
 * Format số (không có VNĐ)
 * @param {number} number 
 * @returns {string}
 */
export const formatNumber = (number) => {
  if (!number && number !== 0) return '';
  return new Intl.NumberFormat('vi-VN').format(number);
};

const dateHelper = {
  formatDate,
  formatDateForAPI,
  parseDateFromAPI,
  daysBetween,
  isExpiringSoon,
  isExpired,
  calculateEndDate,
  formatCurrency,
  formatNumber,
};

export default dateHelper;
