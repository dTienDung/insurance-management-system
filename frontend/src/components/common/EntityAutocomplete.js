import React from 'react';
import { Autocomplete, TextField, Box, Typography } from '@mui/material';

/**
 * EntityAutocomplete - Advanced autocomplete for entity selection
 * Features:
 * - Shows both code and name (e.g., "KH001 - Nguyễn Văn A")
 * - Filter by typing code or name
 * - Customizable display format
 * 
 * @param {string} label - Field label
 * @param {array} options - Array of entity objects
 * @param {object} value - Selected entity object
 * @param {function} onChange - Change handler (event, newValue)
 * @param {function} getOptionLabel - How to display option in dropdown (e.g., "KH001 - Nguyễn Văn A")
 * @param {function} renderOption - Custom render for dropdown item
 * @param {function} isOptionEqualToValue - Compare option with value
 * @param {boolean} required - Required field
 * @param {string} error - Error message
 * @param {boolean} disabled - Disabled state
 * @param {boolean} loading - Loading state
 * @param {string} placeholder - Placeholder text
 */
const EntityAutocomplete = ({
  label,
  options = [],
  value = null,
  onChange,
  getOptionLabel,
  renderOption,
  isOptionEqualToValue,
  required = false,
  error = false,
  helperText = '',
  disabled = false,
  loading = false,
  placeholder = 'Tìm kiếm...',
  ...otherProps
}) => {
  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={onChange}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      isOptionEqualToValue={isOptionEqualToValue}
      disabled={disabled}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
          placeholder={placeholder}
        />
      )}
      {...otherProps}
    />
  );
};

/**
 * Pre-configured EntityAutocomplete for Customer
 */
export const CustomerAutocomplete = ({ value, onChange, error, helperText, ...props }) => (
  <EntityAutocomplete
    label="Khách hàng"
    value={value}
    onChange={onChange}
    error={error}
    helperText={helperText}
    getOptionLabel={(option) => 
      option ? `${option.MaKH || option.customer_id} - ${option.HoTen || option.full_name}` : ''
    }
    renderOption={(props, option) => (
      <Box component="li" {...props}>
        <Box>
          <Typography variant="body1">
            <strong>{option.MaKH || option.customer_id}</strong> - {option.HoTen || option.full_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            CCCD: {option.CMND_CCCD || option.id_number} | SĐT: {option.SDT || option.phone}
          </Typography>
        </Box>
      </Box>
    )}
    isOptionEqualToValue={(option, value) => 
      (option.MaKH || option.customer_id) === (value.MaKH || value.customer_id)
    }
    {...props}
  />
);

/**
 * Pre-configured EntityAutocomplete for Vehicle
 */
export const VehicleAutocomplete = ({ value, onChange, error, helperText, ...props }) => (
  <EntityAutocomplete
    label="Xe"
    value={value}
    onChange={onChange}
    error={error}
    helperText={helperText}
    getOptionLabel={(option) => 
      option ? `${option.MaXe || option.vehicle_id} - ${option.BienSo || option.license_plate || 'Chưa có biển số'}` : ''
    }
    renderOption={(props, option) => (
      <Box component="li" {...props}>
        <Box>
          <Typography variant="body1">
            <strong>{option.MaXe || option.vehicle_id}</strong> - {option.BienSo || option.license_plate || 'Chưa có biển số'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {option.HangXe || option.brand} {option.DongXe || option.model} ({option.NamSX || option.year})
          </Typography>
        </Box>
      </Box>
    )}
    isOptionEqualToValue={(option, value) => 
      (option.MaXe || option.vehicle_id) === (value.MaXe || value.vehicle_id)
    }
    {...props}
  />
);

/**
 * Pre-configured EntityAutocomplete for Insurance Package
 */
export const PackageAutocomplete = ({ value, onChange, error, helperText, ...props }) => (
  <EntityAutocomplete
    label="Gói bảo hiểm"
    value={value}
    onChange={onChange}
    error={error}
    helperText={helperText}
    getOptionLabel={(option) => 
      option ? `${option.MaGoi || option.package_id} - ${option.TenGoi || option.package_name}` : ''
    }
    renderOption={(props, option) => (
      <Box component="li" {...props}>
        <Box>
          <Typography variant="body1">
            <strong>{option.MaGoi || option.package_id}</strong> - {option.TenGoi || option.package_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Tỷ lệ: {option.TyLePhiCoBan || option.base_rate}%
          </Typography>
        </Box>
      </Box>
    )}
    isOptionEqualToValue={(option, value) => 
      (option.MaGoi || option.package_id) === (value.MaGoi || value.package_id)
    }
    {...props}
  />
);

/**
 * Pre-configured EntityAutocomplete for Contract
 */
export const ContractAutocomplete = ({ value, onChange, error, helperText, ...props }) => (
  <EntityAutocomplete
    label="Hợp đồng"
    value={value}
    onChange={onChange}
    error={error}
    helperText={helperText}
    getOptionLabel={(option) => 
      option ? `${option.MaHD || option.contract_id} - ${option.TenKH || option.customer_name || ''}` : ''
    }
    renderOption={(props, option) => (
      <Box component="li" {...props}>
        <Box>
          <Typography variant="body1">
            <strong>{option.MaHD || option.contract_id}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            KH: {option.TenKH || option.customer_name} | Phí: {(option.PhiBaoHiem || option.premium)?.toLocaleString('vi-VN')}đ
          </Typography>
        </Box>
      </Box>
    )}
    isOptionEqualToValue={(option, value) => 
      (option.MaHD || option.contract_id) === (value.MaHD || value.contract_id)
    }
    {...props}
  />
);

export default EntityAutocomplete;
