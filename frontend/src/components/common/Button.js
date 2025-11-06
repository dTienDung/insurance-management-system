import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick, 
  type = 'button',
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  fullWidth = false,
  className = '',
  ...props
}) => {
  // Map custom variants to MUI variants and colors
  const variantMapping = {
    primary: { variant: 'contained', color: 'primary' },
    secondary: { variant: 'contained', color: 'secondary' },
    success: { variant: 'contained', color: 'success' },
    danger: { variant: 'contained', color: 'error' },
    warning: { variant: 'contained', color: 'warning' },
    outline: { variant: 'outlined', color: 'primary' },
    ghost: { variant: 'text', color: 'primary' }
  };

  const { variant: muiVariant, color } = variantMapping[variant] || variantMapping.primary;

  return (
    <MuiButton
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      variant={muiVariant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      endIcon={endIcon}
      className={className}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;