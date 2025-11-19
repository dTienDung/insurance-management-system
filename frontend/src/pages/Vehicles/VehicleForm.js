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
  Box,
  MenuItem,
  Divider,
  Autocomplete,
  CircularProgress,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import vehicleService from '../../services/vehicleService';
import Button from '../../components/common/Button';

const VehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    MaXe: '', // Display only
    vehicle_type: 'Sedan',
    manufacturer: '',
    model: '',
    manufacturing_year: new Date().getFullYear(),
    engine_number: '',
    chassis_number: '',
    color: '',
    notes: '',
    customer_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = !!id;

  // Danh sách các loại xe phổ biến (match businessRules.js validTypes)
  const vehicleTypes = [
    { value: 'Sedan', label: 'Xe con (Sedan)' },
    { value: 'Motorcycle', label: 'Xe máy' },
    { value: 'Truck', label: 'Xe tải' },
    { value: 'Bus', label: 'Xe khách' },
    { value: 'Van', label: 'Xe van' },
    { value: 'SUV', label: 'Xe SUV' }
  ];

  // Danh sách hãng xe phổ biến
  const manufacturers = [
    'Toyota', 'Honda', 'Mazda', 'Ford', 'Hyundai', 
    'Kia', 'Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen',
    'Nissan', 'Mitsubishi', 'Suzuki', 'Chevrolet', 'Lexus',
    'Vinfast', 'Thaco', 'Yamaha', 'Piaggio', 'SYM'
  ].sort();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (id) {
      fetchVehicle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getById(id);
      setFormData({
        MaXe: data.vehicle.MaXe || data.vehicle.vehicle_id || '',
        vehicle_type: data.vehicle.vehicle_type || data.vehicle.LoaiXe || 'car',
        manufacturer: data.vehicle.manufacturer || data.vehicle.HangXe || '',
        model: data.vehicle.model || data.vehicle.DongXe || '',
        manufacturing_year: data.vehicle.manufacturing_year || data.vehicle.NamSX || new Date().getFullYear(),
        engine_number: data.vehicle.engine_number || data.vehicle.SoMay || '',
        chassis_number: data.vehicle.chassis_number || data.vehicle.SoKhung || '',
        color: data.vehicle.color || data.vehicle.MauSac || '',
        notes: data.vehicle.notes || data.vehicle.GhiChu || ''
      });
    } catch (err) {
      setError('Lỗi khi tải thông tin phương tiện');
      console.error('Error fetching vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.manufacturer.trim()) {
      setError('Vui lòng chọn hoặc nhập hãng xe');
      return;
    }

    if (!formData.model.trim()) {
      setError('Vui lòng nhập model xe');
      return;
    }

    if (!formData.engine_number.trim()) {
      setError('Vui lòng nhập số máy');
      return;
    }

    if (!formData.chassis_number.trim()) {
      setError('Vui lòng nhập số khung');
      return;
    }

    // LUẬT NGHIỆP VỤ: VIN phải đúng 17 ký tự
    if (formData.chassis_number.trim().length !== 17) {
      setError('Số khung (VIN) phải có đúng 17 ký tự');
      return;
    }

    // LUẬT NGHIỆP VỤ: Năm sản xuất >= 1990 và <= năm hiện tại + 1
    const currentYear = new Date().getFullYear();
    if (formData.manufacturing_year < 1990) {
      setError('Năm sản xuất phải từ 1990 trở về sau');
      return;
    }
    if (formData.manufacturing_year > currentYear + 1) {
      setError(`Năm sản xuất không được vượt quá ${currentYear + 1}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dataToSubmit = {
        LoaiXe: formData.vehicle_type,
        HangXe: formData.manufacturer.trim(),
        DongXe: formData.model.trim(),
        NamSX: parseInt(formData.manufacturing_year),
        SoMay: formData.engine_number.trim().toUpperCase(),
        SoKhung: formData.chassis_number.trim().toUpperCase(),
        MauSac: formData.color.trim() || null,
        GhiChu: formData.notes.trim() || null
      };

      console.log('=== DEBUG: Form Data ===');
      console.log('formData:', formData);
      console.log('dataToSubmit:', dataToSubmit);
      console.log('=======================');

      if (isEditMode) {
        await vehicleService.update(id, dataToSubmit);
        alert('Cập nhật phương tiện thành công');
      } else {
        await vehicleService.create(dataToSubmit);
        alert('Thêm phương tiện mới thành công');
      }
      
      navigate('/vehicles');
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi lưu phương tiện');
      console.error('Error saving vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  if (isEditMode && loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {isEditMode ? 'Chỉnh sửa phương tiện' : 'Thêm phương tiện mới'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isEditMode ? 'Cập nhật thông tin phương tiện' : 'Nhập thông tin phương tiện mới'}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          {/* Customer Selection */}
          <Box sx={{ mb: 4 }}>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Vehicle Info */}
          <Typography variant="h6" gutterBottom>
            Thông tin xe
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Vehicle Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Loại xe</InputLabel>
                <Select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleChange}
                  label="Loại xe"
                >
                  {vehicleTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Manufacturer */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={manufacturers}
                value={formData.manufacturer}
                onChange={(e, newValue) => {
                  setFormData(prev => ({ ...prev, manufacturer: newValue || '' }));
                }}
                onInputChange={(e, newValue) => {
                  setFormData(prev => ({ ...prev, manufacturer: newValue || '' }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Hãng xe *"
                    required
                    placeholder="Chọn hoặc nhập hãng xe"
                  />
                )}
              />
            </Grid>

            {/* Model */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Model *"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                placeholder="Ví dụ: Civic, Corolla"
              />
            </Grid>

            {/* Manufacturing Year */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Năm sản xuất *"
                name="manufacturing_year"
                value={formData.manufacturing_year}
                onChange={handleChange}
                required
              >
                {years.map(year => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Color */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Màu sắc"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="Ví dụ: Trắng, Đen"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Technical Info */}
          <Typography variant="h6" gutterBottom>
            Thông tin kỹ thuật
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Engine Number */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số máy *"
                name="engine_number"
                value={formData.engine_number}
                onChange={handleChange}
                required
                placeholder="Nhập số máy"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>

            {/* Chassis Number (VIN) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số khung (VIN) *"
                name="chassis_number"
                value={formData.chassis_number}
                onChange={handleChange}
                required
                placeholder="Nhập số khung VIN (17 ký tự)"
                inputProps={{ style: { textTransform: 'uppercase' }, maxLength: 17 }}
                helperText="VIN phải có 17 ký tự (chữ và số)"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Notes */}
          <TextField
            fullWidth
            label="Ghi chú"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={4}
            placeholder="Nhập các ghi chú về phương tiện"
            sx={{ mb: 4 }}
          />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/vehicles')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isEditMode ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="ghost"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/vehicles')}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              startIcon={<SaveIcon />}
              type="submit"
              loading={loading}
            >
              {isEditMode ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Help Section */}
      <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          💡 Gợi ý:
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Số khung (VIN) phải có đúng 17 ký tự và duy nhất cho mỗi xe</li>
          <li>Biển số xe và chủ sở hữu được quản lý qua bảng KhachHangXe</li>
          <li>Số máy và số khung phải chính xác theo đăng ký xe</li>
          <li>Kiểm tra kỹ thông tin trước khi lưu để tránh sai sót</li>
        </ul>
      </Alert>
    </Container>
  );
};

export default VehicleForm;
