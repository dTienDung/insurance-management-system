import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Button,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import customerService from '../../services/customerService';

const CustomerModal = ({ open, onClose, customerId, onSuccess }) => {
  const [formData, setFormData] = useState({
    HoTen: '',
    CMND_CCCD: '',
    NgaySinh: '',
    SDT: '',
    Email: '',
    DiaChi: '',
    GhiChu: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (customerId) {
        fetchCustomer();
      } else {
        resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, open]);

  const fetchCustomer = async () => {
    try {
      const response = await customerService.getById(customerId);
      const data = response.data || response;
      setFormData({
        HoTen: data.HoTen || '',
        CMND_CCCD: data.CMND_CCCD || '',
        NgaySinh: data.NgaySinh ? data.NgaySinh.split('T')[0] : '',
        SDT: data.SDT || '',
        Email: data.Email || '',
        DiaChi: data.DiaChi || '',
        GhiChu: data.GhiChu || ''
      });
    } catch (error) {
      console.error('Error fetching customer:', error);
      alert('Không thể tải thông tin khách hàng');
    }
  };

  const resetForm = () => {
    setFormData({
      HoTen: '',
      CMND_CCCD: '',
      NgaySinh: '',
      SDT: '',
      Email: '',
      DiaChi: '',
      GhiChu: ''
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.HoTen.trim()) newErrors.HoTen = 'Vui lòng nhập họ tên';
    
    // LUẬT NGHIỆP VỤ: CCCD phải 9 hoặc 12 số
    if (!formData.CMND_CCCD.trim()) {
      newErrors.CMND_CCCD = 'Vui lòng nhập CMND/CCCD';
    } else if (!/^\d{9}$|^\d{12}$/.test(formData.CMND_CCCD)) {
      newErrors.CMND_CCCD = 'CMND/CCCD phải có độ dài 9 hoặc 12 số';
    }
    
    if (!formData.SDT.trim()) newErrors.SDT = 'Vui lòng nhập số điện thoại';
    
    // LUẬT NGHIỆP VỤ: Tuổi >= 18
    if (!formData.NgaySinh) {
      newErrors.NgaySinh = 'Vui lòng chọn ngày sinh';
    } else {
      const birthDate = new Date(formData.NgaySinh);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear() - 
        (today.getMonth() < birthDate.getMonth() || 
         (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
      
      if (age < 18) {
        newErrors.NgaySinh = 'Chủ xe phải đủ 18 tuổi trở lên';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const submitData = {
        hoTen: formData.HoTen,
        cccd: formData.CMND_CCCD,
        ngaySinh: formData.NgaySinh,
        diaChi: formData.DiaChi,
        sdt: formData.SDT,
        email: formData.Email
      };

      if (customerId) {
        await customerService.update(customerId, submitData);
      } else {
        await customerService.create(submitData);
      }
      onSuccess && onSuccess();
      handleClose();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {customerId ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Họ và tên *"
              name="HoTen"
              value={formData.HoTen}
              onChange={handleChange}
              error={!!errors.HoTen}
              helperText={errors.HoTen}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="CMND/CCCD *"
              name="CMND_CCCD"
              value={formData.CMND_CCCD}
              onChange={handleChange}
              error={!!errors.CMND_CCCD}
              helperText={errors.CMND_CCCD}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ngày sinh *"
              name="NgaySinh"
              type="date"
              value={formData.NgaySinh}
              onChange={handleChange}
              error={!!errors.NgaySinh}
              helperText={errors.NgaySinh}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Số điện thoại *"
              name="SDT"
              value={formData.SDT}
              onChange={handleChange}
              error={!!errors.SDT}
              helperText={errors.SDT}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="Email"
              type="email"
              value={formData.Email}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Địa chỉ"
              name="DiaChi"
              value={formData.DiaChi}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Ghi chú"
              name="GhiChu"
              value={formData.GhiChu}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Hủy</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Đang lưu...' : customerId ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerModal;
