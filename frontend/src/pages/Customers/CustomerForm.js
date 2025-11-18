import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Grid,
  Stack,
  Alert,
  Box
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import customerService from '../../services/customerService';
import Button from '../../components/common/Button';

const CustomerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    HoTen: '',
    CMND_CCCD: '',
    NgaySinh: '',
    DiaChi: '',
    SDT: '',
    Email: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await customerService.getById(id);
      const customer = response.data;
      setFormData({
        HoTen: customer.HoTen || '',
        CMND_CCCD: customer.CMND_CCCD || '',
        NgaySinh: customer.NgaySinh?.split('T')[0] || '',
        DiaChi: customer.DiaChi || '',
        SDT: customer.SDT || '',
        Email: customer.Email || ''
      });
    } catch (error) {
      setAlert({ type: 'error', message: 'Không thể tải thông tin khách hàng' });
      setTimeout(() => navigate('/customers'), 2000);
    }
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
    
    if (!formData.HoTen.trim()) newErrors.HoTen = 'Vui lòng nhập họ tên';
    
    // LUẬT NGHIỆP VỤ: CCCD phải 9 hoặc 12 số
    if (!formData.CMND_CCCD.trim()) {
      newErrors.CMND_CCCD = 'Vui lòng nhập CMND/CCCD';
    } else if (!/^\d{9}$|^\d{12}$/.test(formData.CMND_CCCD)) {
      newErrors.CMND_CCCD = 'CMND/CCCD phải có độ dài 9 hoặc 12 số';
    }
    
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
    
    if (!formData.SDT.trim()) newErrors.SDT = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{10}$/.test(formData.SDT)) {
      newErrors.SDT = 'Số điện thoại phải có 10 chữ số';
    }
    if (formData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      newErrors.Email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      
      if (isEdit) {
        await customerService.update(id, submitData);
        setAlert({ type: 'success', message: 'Cập nhật khách hàng thành công!' });
      } else {
        await customerService.create(submitData);
        setAlert({ type: 'success', message: 'Thêm khách hàng thành công!' });
      }
      
      setTimeout(() => navigate('/customers'), 1500);
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Có lỗi xảy ra' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {isEdit ? 'Cập nhật Khách hàng' : 'Thêm Khách hàng mới'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isEdit ? 'Chỉnh sửa thông tin khách hàng' : 'Nhập thông tin khách hàng mới'}
        </Typography>
      </Box>

      {/* Alert */}
      {alert && (
        <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {/* Form */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Họ tên */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Họ và tên *"
                name="HoTen"
                value={formData.HoTen}
                onChange={handleChange}
                required
                error={Boolean(errors.HoTen)}
                helperText={errors.HoTen}
              />
            </Grid>

            {/* CMND/CCCD */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CMND/CCCD *"
                name="CMND_CCCD"
                value={formData.CMND_CCCD}
                onChange={handleChange}
                required
                error={Boolean(errors.CMND_CCCD)}
                helperText={errors.CMND_CCCD}
              />
            </Grid>

            {/* Ngày sinh */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Ngày sinh *"
                name="NgaySinh"
                value={formData.NgaySinh}
                onChange={handleChange}
                required
                error={Boolean(errors.NgaySinh)}
                helperText={errors.NgaySinh}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Địa chỉ */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                name="DiaChi"
                value={formData.DiaChi}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            {/* Số điện thoại */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số điện thoại *"
                name="SDT"
                value={formData.SDT}
                onChange={handleChange}
                required
                placeholder="0912345678"
                error={Boolean(errors.SDT)}
                helperText={errors.SDT}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                placeholder="example@email.com"
                error={Boolean(errors.Email)}
                helperText={errors.Email}
              />
            </Grid>
          </Grid>

          {/* Actions */}
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
            <Button
              variant="ghost"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/customers')}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              startIcon={<SaveIcon />}
              type="submit"
              loading={loading}
            >
              {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default CustomerForm;