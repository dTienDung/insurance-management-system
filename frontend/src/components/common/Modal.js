import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  ...props
}) => {
  // Map size to maxWidth
  const sizeMapping = {
    sm: 'sm',      // 600px
    md: 'md',      // 900px
    lg: 'lg',      // 1200px
    xl: 'xl',      // 1536px
    full: false    // Full width
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth={sizeMapping[size]}
      fullWidth
      {...props}
    >
      {/* Header with close button */}
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {title}
          {showCloseButton && (
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: 'text.primary' }
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      {/* Body */}
      <DialogContent dividers>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;