// ============================================
// PJICO - Language Provider Context
// Quản lý ngôn ngữ toàn ứng dụng
// ============================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import enUS from 'antd/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';

// Create Language Context
const LanguageContext = createContext();

// Language configurations
const LANGUAGES = {
  vi: {
    code: 'vi',
    name: 'Tiếng Việt',
    flag: '🇻🇳',
    antdLocale: viVN,
    dayjsLocale: 'vi',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'DD/MM/YYYY HH:mm',
    currency: 'VND',
    currencySymbol: '₫',
    thousandSeparator: '.',
    decimalSeparator: ',',
  },
  en: {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    antdLocale: enUS,
    dayjsLocale: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'h:mm A',
    dateTimeFormat: 'MM/DD/YYYY h:mm A',
    currency: 'USD',
    currencySymbol: '$',
    thousandSeparator: ',',
    decimalSeparator: '.',
  }
};

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get saved language from localStorage
    const savedLang = localStorage.getItem('pjico_language');
    return LANGUAGES[savedLang] || LANGUAGES.vi;
  });

  // Update dayjs locale when language changes
  useEffect(() => {
    dayjs.locale(currentLanguage.dayjsLocale);
  }, [currentLanguage]);

  // Change language function
  const changeLanguage = (langCode) => {
    if (LANGUAGES[langCode]) {
      const newLang = LANGUAGES[langCode];
      setCurrentLanguage(newLang);
      localStorage.setItem('pjico_language', langCode);
      dayjs.locale(newLang.dayjsLocale);
      
      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: newLang } 
      }));
    }
  };

  // Format functions based on current language
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '';
    
    const formatter = new Intl.NumberFormat(
      currentLanguage.code === 'vi' ? 'vi-VN' : 'en-US',
      {
        style: 'currency',
        currency: currentLanguage.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    );
    
    return formatter.format(amount);
  };

  const formatNumber = (number) => {
    if (!number && number !== 0) return '';
    
    const formatter = new Intl.NumberFormat(
      currentLanguage.code === 'vi' ? 'vi-VN' : 'en-US'
    );
    
    return formatter.format(number);
  };

  const formatDate = (date, format) => {
    if (!date) return '';
    
    const dateFormat = format || currentLanguage.dateFormat;
    return dayjs(date).format(dateFormat);
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    
    return dayjs(date).format(currentLanguage.dateTimeFormat);
  };

  // Context value
  const value = {
    currentLanguage,
    languages: LANGUAGES,
    changeLanguage,
    formatCurrency,
    formatNumber,
    formatDate,
    formatDateTime,
  };

  return (
    <LanguageContext.Provider value={value}>
      <ConfigProvider locale={currentLanguage.antdLocale}>
        {children}
      </ConfigProvider>
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageProvider;