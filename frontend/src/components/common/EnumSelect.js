import React from 'react';
import { TextField, MenuItem } from '@mui/material';

/**
 * EnumSelect - Reusable dropdown component for enum values
 * 
 * @param {string} name - Field name
 * @param {string} label - Display label
 * @param {string} value - Selected value
 * @param {function} onChange - Change handler
 * @param {object} options - Enum options object { KEY: 'Display Text' }
 * @param {boolean} required - Required field
 * @param {string} error - Error message
 * @param {boolean} disabled - Disabled state
 * @param {string} helperText - Helper text
 */
const EnumSelect = ({
  name,
  label,
  value,
  onChange,
  options = {},
  required = false,
  error = false,
  disabled = false,
  helperText = '',
  ...otherProps
}) => {
  return (
    <TextField
      select
      name={name}
      label={label}
      value={value || ''}
      onChange={onChange}
      required={required}
      error={error}
      disabled={disabled}
      helperText={helperText}
      fullWidth
      {...otherProps}
    >
      {Object.entries(options).map(([key, displayText]) => (
        <MenuItem key={key} value={key}>
          {displayText}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default EnumSelect;
