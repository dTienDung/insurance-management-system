import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import vehicleService from '../../services/vehicleService';
import customerService from '../../services/customerService';
import Button from '../../components/common/Button';

const VehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerIdFromQuery = searchParams.get('customer_id');
  
  const [formData, setFormData] = useState({
    customer_id: customerIdFromQuery || '',
    license_plate: '',
    vehicle_type: 'car',
    manufacturer: '',
    model: '',
    manufacturing_year: new Date().getFullYear(),
    engine_number: '',
    chassis_number: '',
    color: '',
    notes: ''
  });

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  const isEditMode = !!id;

  // Danh sách các loại xe phổ biến
  const vehicleTypes = [
    { value: 'car', label: 'Ô tô' },
    { value: 'motorcycle', label: 'Xe máy' },
    { value: 'truck', label: 'Xe tải' },
    { value: 'bus', label: 'Xe khách' },
    { value: 'van', label: 'Xe van' },
    { value: 'suv', label: 'SUV' },
    { value: 'pickup', label: 'Bán tải' }
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
    fetchCustomers();
    if (id) {
      fetchVehicle();
    }
  }, [id]);

  useEffect(() => {
    if (formData.customer_id) {
      const customer = customers.find(c => c.customer_id === parseInt(formData.customer_id));
      setSelectedCustomer(customer);
    }
  }, [formData.customer_id, customers]);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const data = await customerService.getAll();

      // Normalize possible response shapes: Array, { data: [] }, { customers: [] }, { items: [] }
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      } else if (data && Array.isArray(data.customers)) {
        list = data.customers;
      } else if (data && Array.isArray(data.items)) {
        list = data.items;
      } else {
        console.warn('Unexpected customers response shape, expected array-like but got:', data);
      }

      setCustomers(list);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Lỗi khi tải danh sách khách hàng');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getById(id);
      setFormData({
        customer_id: data.vehicle.customer_id,
        license_plate: data.vehicle.license_plate,
        vehicle_type: data.vehicle.vehicle_type || 'car',
        manufacturer: data.vehicle.manufacturer,
        model: data.vehicle.model,
        manufacturing_year: data.vehicle.manufacturing_year,
        engine_number: data.vehicle.engine_number,
        chassis_number: data.vehicle.chassis_number,
        color: data.vehicle.color || '',
        notes: data.vehicle.notes || ''
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

  const validateLicensePlate = (plate) => {
    // Định dạng biển số Việt Nam: 29A-12345 hoặc 29A12345
    const regex = /^[0-9]{2}[A-Z]{1,2}[0-9]{4,5}$/;
    const formattedPlate = plate.replace(/[-\s]/g, '').toUpperCase();
    return regex.test(formattedPlate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customer_id) {
      setError('Vui lòng chọn khách hàng');
      return;
    }
    
    if (!formData.license_plate.trim()) {
      setError('Vui lòng nhập biển số xe');
      return;
    }

    // Format biển số (loại bỏ dấu gạch ngang và khoảng trắng, viết hoa)
    const formattedPlate = formData.license_plate.replace(/[-\s]/g, '').toUpperCase();
    
    if (!validateLicensePlate(formattedPlate)) {
      setError('Biển số xe không đúng định dạng. Ví dụ: 29A12345 hoặc 29A-12345');
      return;
    }

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

    try {
      setLoading(true);
      setError(null);

      const dataToSubmit = {
        ...formData,
        license_plate: formattedPlate,
        manufacturing_year: parseInt(formData.manufacturing_year)
      };

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

  if (loadingCustomers || (isEditMode && loading)) {
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
            <TextField
              select
              fullWidth
              label="Khách hàng"
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              disabled={isEditMode}
              required
            >
              <MenuItem value="">-- Chọn khách hàng --</MenuItem>
              {customers.map(customer => (
                <MenuItem key={customer.customer_id} value={customer.customer_id}>
                  {customer.full_name} - {customer.phone}
                </MenuItem>
              ))}
            </TextField>
            
            {selectedCustomer && (
              <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'primary.lighter' }}>
                <Typography variant="body2">
                  <strong>CCCD/CMND:</strong> {selectedCustomer.id_number}
                </Typography>
                <Typography variant="body2">
                  <strong>Địa chỉ:</strong> {selectedCustomer.address}
                </Typography>
              </Paper>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Vehicle Info */}
          <Typography variant="h6" gutterBottom>
            Thông tin xe
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* License Plate */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Biển số xe"
                name="license_plate"
                value={formData.license_plate}
                onChange={handleChange}
                required
                placeholder="Ví dụ: 29A-12345"
                helperText="Định dạng: 29A-12345 hoặc 29A12345"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>

            {/* Vehicle Type */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Loại xe"
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                required
              >
                {vehicleTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
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
                    label="Hãng xe"
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
                label="Model"
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
                label="Năm sản xuất"
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
                label="Số máy"
                name="engine_number"
                value={formData.engine_number}
                onChange={handleChange}
                required
                placeholder="Nhập số máy"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>

            {/* Chassis Number */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số khung"
                name="chassis_number"
                value={formData.chassis_number}
                onChange={handleChange}
                required
                placeholder="Nhập số khung"
                inputProps={{ style: { textTransform: 'uppercase' } }}
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
          <li>Biển số xe phải đúng định dạng Việt Nam (VD: 29A-12345)</li>
          <li>Số máy và số khung phải chính xác theo đăng ký xe</li>
          <li>Kiểm tra kỹ thông tin trước khi lưu để tránh sai sót</li>
        </ul>
      </Alert>
    </Container>
  );
};

export default VehicleForm;
