// ============================================
// PJICO - HỆ THỐNG QUẢN LÝ ĐA NGÔN NGỮ
// i18n Configuration
// ============================================

import { VI_TRANSLATIONS } from './vi-translations';

// Cấu hình ngôn ngữ mặc định
const DEFAULT_LANGUAGE = 'vi';

// Danh sách ngôn ngữ được hỗ trợ
export const SUPPORTED_LANGUAGES = {
  vi: {
    code: 'vi',
    name: 'Tiếng Việt',
    flag: '🇻🇳',
    dateFormat: 'DD/MM/YYYY',
    currency: 'VND',
    currencySymbol: '₫',
  },
  en: {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    currencySymbol: '$',
  }
};

// Class quản lý ngôn ngữ
class I18nManager {
  constructor() {
    this.currentLanguage = this.getStoredLanguage() || DEFAULT_LANGUAGE;
    this.translations = {
      vi: VI_TRANSLATIONS,
      // Có thể thêm translations tiếng Anh ở đây nếu cần
    };
  }

  // Lấy ngôn ngữ đã lưu từ localStorage
  getStoredLanguage() {
    try {
      return localStorage.getItem('pjico_language');
    } catch (e) {
      return null;
    }
  }

  // Lưu ngôn ngữ vào localStorage
  setStoredLanguage(lang) {
    try {
      localStorage.setItem('pjico_language', lang);
    } catch (e) {
      console.error('Cannot save language preference:', e);
    }
  }

  // Đổi ngôn ngữ
  changeLanguage(lang) {
    if (SUPPORTED_LANGUAGES[lang]) {
      this.currentLanguage = lang;
      this.setStoredLanguage(lang);
      // Reload page để áp dụng ngôn ngữ mới
      window.location.reload();
    }
  }

  // Lấy ngôn ngữ hiện tại
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // Lấy thông tin ngôn ngữ hiện tại
  getCurrentLanguageInfo() {
    return SUPPORTED_LANGUAGES[this.currentLanguage];
  }

  // Lấy translation theo key
  t(key, params = {}) {
    const keys = key.split('.');
    let value = this.translations[this.currentLanguage];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // Fallback to key if translation not found
        return key;
      }
    }
    
    // Replace parameters in translation
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      Object.keys(params).forEach(param => {
        value = value.replace(`{${param}}`, params[param]);
      });
    }
    
    return value;
  }

  // Format số tiền theo ngôn ngữ
  formatCurrency(amount) {
    const langInfo = this.getCurrentLanguageInfo();
    return new Intl.NumberFormat(langInfo.code === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: langInfo.currency,
    }).format(amount);
  }

  // Format ngày theo ngôn ngữ
  formatDate(date) {
    const langInfo = this.getCurrentLanguageInfo();
    const d = new Date(date);
    
    if (langInfo.code === 'vi') {
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } else {
      return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
    }
  }

  // Format số theo ngôn ngữ
  formatNumber(number) {
    const langInfo = this.getCurrentLanguageInfo();
    return new Intl.NumberFormat(langInfo.code === 'vi' ? 'vi-VN' : 'en-US').format(number);
  }
}

// Tạo instance duy nhất
const i18n = new I18nManager();

// Export các hàm tiện ích
export const t = (key, params) => i18n.t(key, params);
export const changeLanguage = (lang) => i18n.changeLanguage(lang);
export const getCurrentLanguage = () => i18n.getCurrentLanguage();
export const getCurrentLanguageInfo = () => i18n.getCurrentLanguageInfo();
export const formatCurrency = (amount) => i18n.formatCurrency(amount);
export const formatDate = (date) => i18n.formatDate(date);
export const formatNumber = (number) => i18n.formatNumber(number);

export default i18n;