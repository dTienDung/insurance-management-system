// ============================================
// UTILS INDEX
// Export tất cả utility functions
// ============================================

export { default as autoCodeHelper } from './autoCodeHelper';
export { default as fieldMapper } from './fieldMapper';
export { default as validationHelper } from './validationHelper';
export { default as dateHelper } from './dateHelper';
export { default as fileDownload } from './fileDownload';

// Re-export individual functions for convenience
export {
  prepareCreatePayload,
  showCreatedMessage,
  getCustomerFormTemplate,
  getVehicleFormTemplate,
  getContractFormTemplate,
} from './autoCodeHelper';

export {
  mapFieldsToBackend,
  mapFieldsFromBackend,
  mapStatus,
  getStatusColor,
} from './fieldMapper';

export {
  validateCustomer,
  validateVehicle,
  validateContract,
  validatePayment,
  validateLicensePlate,
} from './validationHelper';

export {
  formatDate,
  formatDateForAPI,
  parseDateFromAPI,
  daysBetween,
  isExpiringSoon,
  isExpired,
  calculateEndDate,
  formatCurrency,
  formatNumber,
} from './dateHelper';
