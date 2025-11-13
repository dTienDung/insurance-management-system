/**
 * Format number to Vietnamese currency (VNĐ)
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0 VNĐ';
  return new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ';
};

/**
 * Format number with Vietnamese locale
 * @param {number} value - The value to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return new Intl.NumberFormat('vi-VN').format(value);
};

/**
 * Format date to Vietnamese format (dd/mm/yyyy)
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '-';
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '-';
  return dateObj.toLocaleDateString('vi-VN');
};

/**
 * Format datetime to Vietnamese format
 * @param {string|Date} date - The datetime to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '-';
  return dateObj.toLocaleString('vi-VN');
};

/**
 * Format percentage
 * @param {number} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return value.toFixed(decimals) + '%';
};

/**
 * Shorten large numbers (1000000 -> 1M)
 * @param {number} value - The value to shorten
 * @returns {string} Shortened number string
 */
export const formatShortNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'B';
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toString();
};

/**
 * Calculate days between dates
 * @param {string|Date} fromDate - Start date
 * @param {string|Date} toDate - End date
 * @returns {number} Number of days
 */
export const daysBetween = (fromDate, toDate) => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const diffTime = Math.abs(to - from);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get days remaining until date
 * @param {string|Date} date - The target date
 * @returns {number} Number of days remaining
 */
export const daysRemaining = (date) => {
  if (!date) return 0;
  const target = new Date(date);
  const today = new Date();
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '-';
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as 0xxx xxx xxx
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  return phone;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text || '-';
  return text.substring(0, maxLength) + '...';
};
