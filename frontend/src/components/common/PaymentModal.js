import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Money as CashIcon
} from '@mui/icons-material';

const PaymentModal = ({ isOpen, onClose, contract, onConfirm }) => {
  const [formData, setFormData] = useState({
    HinhThuc: 'Tiền mặt', // Default payment method
    GhiChu: '' // Optional notes
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(formData);
      onClose();
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!contract) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      {/* Header */}
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Xác nhận thanh toán</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Body */}
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Contract Info */}
            <Paper 
              elevation={0} 
              sx={{ 
                bgcolor: 'primary.lighter', 
                p: 2,
                border: '1px solid',
                borderColor: 'primary.light'
              }}
            >
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Mã hợp đồng:
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {contract.contract_number}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Khách hàng:
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {contract.customer_name}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Số tiền:
                  </Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    {parseFloat(contract.premium_amount).toLocaleString('vi-VN')} VNĐ
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Payment Method */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Hình thức thanh toán <span style={{ color: 'red' }}>*</span>
              </Typography>
              <RadioGroup
                name="HinhThuc"
                value={formData.HinhThuc}
                onChange={handleChange}
              >
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1.5, 
                    mb: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <FormControlLabel
                    value="Tiền mặt"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <CashIcon color="action" />
                        <Typography>Tiền mặt</Typography>
                      </Box>
                    }
                  />
                </Paper>

                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1.5, 
                    mb: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <FormControlLabel
                    value="Chuyển khoản"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <BankIcon color="action" />
                        <Typography>Chuyển khoản</Typography>
                      </Box>
                    }
                  />
                </Paper>

                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1.5,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <FormControlLabel
                    value="Thẻ"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <CreditCardIcon color="action" />
                        <Typography>Thẻ ngân hàng</Typography>
                      </Box>
                    }
                  />
                </Paper>
              </RadioGroup>
            </Box>

            {/* Notes */}
            <TextField
              label="Ghi chú"
              name="GhiChu"
              value={formData.GhiChu}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              placeholder="Nhập ghi chú về thanh toán (tùy chọn)..."
            />

            {/* Warning */}
            <Alert severity="warning" icon="⚠️">
              Vui lòng xác nhận đã nhận đủ số tiền trước khi đánh dấu đã thanh toán.
            </Alert>
          </Stack>
        </DialogContent>

        {/* Footer */}
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            color="inherit"
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="success"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            Xác nhận thanh toán
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PaymentModal;