import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Paper,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import contractService from '../../services/contractService';

const ContractFormModal = ({ open, onClose, onSuccess, assessment }) => {
  const [formData, setFormData] = useState({
    MaTD: '',
    GoiBaoHiem: 'Cơ bản',
    PhiBaoHiem: 0,
    NgayBatDau: new Date().toISOString().split('T')[0],
    NgayKetThuc: '',
    TrangThai: 'Chưa thanh toán',
    GhiChu: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [feeDetails, setFeeDetails] = useState(null);

  // Package details based on design doc
  const packages = {
    'Cơ bản': { base: 3000000, description: 'Bảo hiểm bắt buộc trách nhiệm dân sự' },
    'Nâng cao': { base: 5000000, description: 'TNDS + Thiệt hại vật chất' },
    'Cao cấp': { base: 8000000, description: 'TNDS + Vật chất + Người ngồi trên xe' },
    'VIP': { base: 12000000, description: 'Toàn diện + Hỗ trợ 24/7' }
  };

  useEffect(() => {
    if (assessment && open) {
      setFormData(prev => ({
        ...prev,
        MaTD: assessment.MaTD,
        NgayBatDau: new Date().toISOString().split('T')[0],
        NgayKetThuc: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
    }
  }, [assessment, open]);

  useEffect(() => {
    if (formData.GoiBaoHiem && assessment) {
      calculateFee();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.GoiBaoHiem, assessment]);

  const calculateFee = () => {
    const pkg = packages[formData.GoiBaoHiem];
    if (!pkg) return;

    // Base fee from package
    let fee = pkg.base;

    // Adjust by risk level (from assessment)
    const riskMultiplier = {
      'Thấp': 1.0,
      'Trung bình': 1.2,
      'Cao': 1.5,
      'Rất cao': 2.0
    };
    const multiplier = riskMultiplier[assessment.MucDoRuiRo] || 1.0;
    fee = fee * multiplier;

    // Adjust by age (if available in assessment data)
    // Assuming we have vehicle age info
    const vehicleAge = new Date().getFullYear() - (assessment.NamSX || 2020);
    if (vehicleAge > 10) fee = fee * 1.3;
    else if (vehicleAge > 5) fee = fee * 1.15;

    setFeeDetails({
      baseFee: pkg.base,
      riskMultiplier: multiplier,
      ageAdjustment: vehicleAge > 10 ? 1.3 : (vehicleAge > 5 ? 1.15 : 1.0),
      finalFee: Math.round(fee)
    });

    setFormData(prev => ({ ...prev, PhiBaoHiem: Math.round(fee) }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.MaTD) newErrors.MaTD = 'Thiếu mã thẩm định';
    if (!formData.GoiBaoHiem) newErrors.GoiBaoHiem = 'Vui lòng chọn gói bảo hiểm';
    if (!formData.NgayBatDau) newErrors.NgayBatDau = 'Vui lòng chọn ngày bắt đầu';
    if (!formData.NgayKetThuc) newErrors.NgayKetThuc = 'Vui lòng chọn ngày kết thúc';
    if (formData.NgayBatDau && formData.NgayKetThuc && new Date(formData.NgayKetThuc) <= new Date(formData.NgayBatDau)) {
      newErrors.NgayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        TrangThai: 'Chưa thanh toán' // Always start as unpaid
      };
      await contractService.create(payload);
      alert('✅ Tạo hợp đồng thành công!');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating contract:', error);
      alert('❌ Lỗi khi tạo hợp đồng!');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      MaTD: '',
      GoiBaoHiem: 'Cơ bản',
      PhiBaoHiem: 0,
      NgayBatDau: new Date().toISOString().split('T')[0],
      NgayKetThuc: '',
      TrangThai: 'Chưa thanh toán',
      GhiChu: ''
    });
    setErrors({});
    setFeeDetails(null);
    onClose();
  };

  if (!assessment) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={700}>Tạo Hợp đồng từ Thẩm định</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {/* Assessment Info */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Thông tin thẩm định</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Mã thẩm định:</strong> {assessment.MaTD}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Mức rủi ro:</strong> {assessment.MucDoRuiRo}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Kết quả:</strong> {assessment.KetQua}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Điểm:</strong> {assessment.DiemThamDinh || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {/* Package Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.GoiBaoHiem}>
              <InputLabel>Gói bảo hiểm *</InputLabel>
              <Select
                name="GoiBaoHiem"
                value={formData.GoiBaoHiem}
                onChange={handleChange}
                label="Gói bảo hiểm *"
              >
                {Object.entries(packages).map(([key, pkg]) => (
                  <MenuItem key={key} value={key}>
                    <Box>
                      <Typography variant="body1">{key}</Typography>
                      <Typography variant="caption" color="text.secondary">{pkg.description}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.GoiBaoHiem && <FormHelperText>{errors.GoiBaoHiem}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Fee Calculation Display */}
          {feeDetails && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'primary.lighter' }}>
                <Typography variant="subtitle2" gutterBottom>Chi tiết phí bảo hiểm</Typography>
                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Phí gốc (gói {formData.GoiBaoHiem}):</Typography>
                    <Typography variant="body2">{feeDetails.baseFee.toLocaleString('vi-VN')} ₫</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Hệ số rủi ro (x{feeDetails.riskMultiplier}):</Typography>
                    <Typography variant="body2">{(feeDetails.baseFee * feeDetails.riskMultiplier).toLocaleString('vi-VN')} ₫</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Điều chỉnh tuổi xe (x{feeDetails.ageAdjustment}):</Typography>
                    <Typography variant="body2">{(feeDetails.baseFee * feeDetails.riskMultiplier * feeDetails.ageAdjustment).toLocaleString('vi-VN')} ₫</Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={700}>Tổng phí:</Typography>
                    <Typography variant="h6" fontWeight={700} color="primary">{feeDetails.finalFee.toLocaleString('vi-VN')} ₫</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          )}

          {/* Date Range */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Ngày bắt đầu *"
              name="NgayBatDau"
              type="date"
              value={formData.NgayBatDau}
              onChange={handleChange}
              error={!!errors.NgayBatDau}
              helperText={errors.NgayBatDau}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Ngày kết thúc *"
              name="NgayKetThuc"
              type="date"
              value={formData.NgayKetThuc}
              onChange={handleChange}
              error={!!errors.NgayKetThuc}
              helperText={errors.NgayKetThuc}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Ghi chú"
              name="GhiChu"
              value={formData.GhiChu}
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="Ghi chú về hợp đồng..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Tạo hợp đồng'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContractFormModal;
