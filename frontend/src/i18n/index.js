// ============================================
// PJICO - i18n Exports
// ============================================

export { default as i18n } from './i18n-config';
export { VI_TRANSLATIONS } from './vi-translations';
export * from './i18n-config';

// Export for backward compatibility
import MESSAGES_VI from './vi';
export { MESSAGES_VI };
export default MESSAGES_VI;