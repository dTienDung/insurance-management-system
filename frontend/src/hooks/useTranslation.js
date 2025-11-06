// ============================================
// PJICO - REACT HOOK CHO HỆ THỐNG ĐA NGÔN NGỮ
// useTranslation Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';
import i18n, { 
  t as translate, 
  changeLanguage as changeLang,
  getCurrentLanguage,
  getCurrentLanguageInfo,
  formatCurrency as formatCurr,
  formatDate as formatDt,
  formatNumber as formatNum,
  SUPPORTED_LANGUAGES
} from '../i18n/i18n-config';

/**
 * Hook để sử dụng hệ thống dịch trong React components
 * 
 * @example
 * const { t, language, changeLanguage } = useTranslation();
 * 
 * return (
 *   <div>
 *     <h1>{t('dashboard.title')}</h1>
 *     <button onClick={() => changeLanguage('en')}>English</button>
 *   </div>
 * );
 */
export function useTranslation() {
  const [language, setLanguage] = useState(getCurrentLanguage());
  const [languageInfo, setLanguageInfo] = useState(getCurrentLanguageInfo());

  // Hàm dịch với memoization
  const t = useCallback((key, params) => {
    return translate(key, params);
  }, []); // Không cần dependency language

  // Hàm đổi ngôn ngữ
  const changeLanguage = useCallback((newLang) => {
    if (SUPPORTED_LANGUAGES[newLang]) {
      changeLang(newLang);
      setLanguage(newLang);
      setLanguageInfo(SUPPORTED_LANGUAGES[newLang]);
    }
  }, []);

  // Format functions với memoization
  const formatCurrency = useCallback((amount) => {
    return formatCurr(amount);
  }, []); // Không cần dependency

  const formatDate = useCallback((date) => {
    return formatDt(date);
  }, []); // Không cần dependency

  const formatNumber = useCallback((number) => {
    return formatNum(number);
  }, []); // Không cần dependency

  // Lắng nghe sự kiện thay đổi ngôn ngữ từ các components khác
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(getCurrentLanguage());
      setLanguageInfo(getCurrentLanguageInfo());
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, []);

  return {
    // Translation function
    t,
    
    // Current language
    language,
    languageInfo,
    
    // Language management
    changeLanguage,
    languages: SUPPORTED_LANGUAGES,
    
    // Formatting functions
    formatCurrency,
    formatDate,
    formatNumber,
    
    // Direct access to i18n instance
    i18n,
  };
}

/**
 * HOC để wrap component với translation context
 * 
 * @example
 * export default withTranslation(MyComponent);
 */
export function withTranslation(Component) {
  return function TranslatedComponent(props) {
    const translationProps = useTranslation();
    return <Component {...props} {...translationProps} />;
  };
}

/**
 * Component để hiển thị text đã dịch
 * 
 * @example
 * <Trans i18nKey="dashboard.title" />
 * <Trans i18nKey="messages.validation.minLength" values={{ min: 8 }} />
 */
export function Trans({ i18nKey, values = {}, children }) {
  const { t } = useTranslation();
  
  if (children && typeof children === 'function') {
    return children(t(i18nKey, values));
  }
  
  return t(i18nKey, values);
}

/**
 * Component để chuyển đổi ngôn ngữ
 * 
 * @example
 * <LanguageSwitcher />
 */
export function LanguageSwitcher({ className = '', showFlag = true, showName = true }) {
  const { language, languages, changeLanguage } = useTranslation();
  
  return (
    <div className={`language-switcher ${className}`}>
      {Object.keys(languages).map(lang => (
        <button
          key={lang}
          className={`language-btn ${language === lang ? 'active' : ''}`}
          onClick={() => changeLanguage(lang)}
          disabled={language === lang}
        >
          {showFlag && <span className="language-flag">{languages[lang].flag}</span>}
          {showName && <span className="language-name">{languages[lang].name}</span>}
        </button>
      ))}
    </div>
  );
}

// Export default hook
export default useTranslation;