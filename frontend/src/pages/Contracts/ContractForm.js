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
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  Info as InfoIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  CalendarToday as CalendarIcon,
  MonetizationOn as MoneyIcon
} from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import contractService from '../../services/contractService';
import customerService from '../../services/customerService';
import vehicleService from '../../services/vehicleService';
import Button from '../../components/common/Button';

const ContractForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerIdFromQuery = searchParams.get('customer_id');
  const vehicleIdFromQuery = searchParams.get('vehicle_id');
  
  const [formData, setFormData] = useState({
    customer_id: customerIdFromQuery || '',
    vehicle_id: vehicleIdFromQuery || '',
    insurance_type: 'TNDS',
    premium_amount: '',
    coverage_amount: '',
    start_date: dayjs(),
    end_date: dayjs().add(1, 'year'),
    notes: ''
  });

  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const isEditMode = !!id;

  // Insurance types
  const insuranceTypes = [
    { value: 'TNDS', label: 'Bảo hiểm Trách nhiệm dân sự (TNDS)' },
    { value: 'TNDS_BB', label: 'TNDS + Bảo hiểm vật chất xe (BB)' },
    { value: 'FULL', label: 'Bảo hiểm toàn diện (Full)' },
    { value: 'VCX', label: 'Bảo hiểm vật chất xe (VCX)' },
    { value: 'CUSTOM', label: 'Tùy chỉnh' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (id) {
      fetchContract();
    }
  }, [id]);

  useEffect(() => {
    if (formData.customer_id && customers.length > 0) {
      const customer = customers.find(c => 
        c.customer_id === parseInt(formData.customer_id) ||
        c.MaKH === parseInt(formData.customer_id)
      );
      setSelectedCustomer(customer);
      
      // Load vehicles of selected customer
      if (customer) {
        fetchCustomerVehicles(customer.customer_id || customer.MaKH);
      }
    }
  }, [formData.customer_id, customers]);

  useEffect(() => {
    if (formData.vehicle_id && vehicles.length > 0) {
      const vehicle = vehicles.find(v => 
        v.vehicle_id === parseInt(formData.vehicle_id) ||
        v.MaXe === parseInt(formData.vehicle_id)
      );
      setSelectedVehicle(vehicle);
    }
  }, [formData.vehicle_id, vehicles]);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      const [customersRes] = await Promise.all([
        customerService.getAll()
      ]);
      
      console.log('Customers:', customersRes);
      
      if (customersRes.data) {
        setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
      } else if (Array.isArray(customersRes)) {
        setCustomers(customersRes);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Lỗi khi tải dữ liệu');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchCustomerVehicles = async (customerId) => {
    try {
      const response = await vehicleService.getByCustomerId(customerId);
      console.log('Customer vehicles:', response);
      
      if (response.data) {
        setVehicles(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        setVehicles(response);
      }
    } catch (err) {
      console.error('Error loading vehicles:', err);
      // If specific API doesn't exist, load all vehicles
      try {
        const allVehicles = await vehicleService.getAll();
        const customerVehicles = allVehicles.data?.filter(v => 
          v.customer_id === customerId || v.MaKH === customerId
        ) || [];
        setVehicles(customerVehicles);
      } catch (err2) {
        console.error('Error loading all vehicles:', err2);
      }
    }
  };

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await contractService.getById(id);
      console.log('Contract data:', response);
      
      const contract = response.data || response.contract || response;
      
      setFormData({
        customer_id: contract.customer_id || contract.MaKH || '',
        vehicle_id: contract.vehicle_id || contract.MaXe || '',
        insurance_type: contract.insurance_type || contract.LoaiBH || 'TNDS',
        premium_amount: contract.premium_amount || contract.PhiBaoHiem || '',
        coverage_amount: contract.coverage_amount || contract.SoTienBH || '',
        start_date: contract.start_date || contract.NgayBatDau ? 
          dayjs(contract.start_date || contract.NgayBatDau) : dayjs(),
        end_date: contract.end_date || contract.NgayKetThuc ? 
          dayjs(contract.end_date || contract.NgayKetThuc) : dayjs().add(1, 'year'),
        notes: contract.notes || contract.GhiChu || ''
      });
    } catch (err) {
      setError('Lỗi khi tải thông tin hợp đồng');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleDateChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateEndDate = (startDate) => {
    return dayjs(startDate).add(1, 'year');
  };

  const handleStartDateChange = (value) => {
    setFormData(prev => ({
      ...prev,
      start_date: value,
      end_date: calculateEndDate(value)
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.customer_id) errors.push('Vui lòng chọn khách hàng');
    if (!formData.vehicle_id) errors.push('Vui lòng chọn phương tiện');
    if (!formData.insurance_type) errors.push('Vui lòng chọn loại bảo hiểm');
    if (!formData.premium_amount || parseFloat(formData.premium_amount) <= 0) {
      errors.push('Phí bảo hiểm phải lớn hơn 0');
    }
    if (!formData.coverage_amount || parseFloat(formData.coverage_amount) <= 0) {
      errors.push('Số tiền bảo hiểm phải lớn hơn 0');
    }
    if (!formData.start_date) errors.push('Vui lòng chọn ngày bắt đầu');
    if (!formData.end_date) errors.push('Vui lòng chọn ngày kết thúc');
    
    if (formData.start_date && formData.end_date) {
      if (dayjs(formData.end_date).isBefore(dayjs(formData.start_date))) {
        errors.push('Ngày kết thúc phải sau ngày bắt đầu');
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dataToSubmit = {
        customer_id: parseInt(formData.customer_id),
        vehicle_id: parseInt(formData.vehicle_id),
        insurance_type: formData.insurance_type,
        premium_amount: parseFloat(formData.premium_amount),
        coverage_amount: parseFloat(formData.coverage_amount),
        start_date: formData.start_date.format('YYYY-MM-DD'),
        end_date: formData.end_date.format('YYYY-MM-DD'),
        notes: formData.notes,
        status: 'active'
      };

      console.log('Submitting:', dataToSubmit);

      if (isEditMode) {
        await contractService.update(id, dataToSubmit);
        alert('Cập nhật hợp đồng thành công');
      } else {
        await contractService.create(dataToSubmit);
        alert('Tạo hợp đồng mới thành công');
      }
      
      navigate('/contracts');
    } catch (err) {
      console.error('Save error:', err);
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData || (isEditMode && loading)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {isEditMode ? 'Chỉnh sửa hợp đồng' : 'Tạo hợp đồng mới'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEditMode ? 'Cập nhật thông tin hợp đồng bảo hiểm' : 'Nhập thông tin hợp đồng bảo hiểm mới'}
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
            {/* Customer & Vehicle Selection */}
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              Thông tin bên tham gia
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Customer Selection */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Khách hàng"
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleChange}
                  disabled={isEditMode}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">-- Chọn khách hàng --</MenuItem>
                  {customers.map(customer => {
                    const customerId = customer.customer_id || customer.MaKH;
                    const fullName = customer.full_name || customer.HoTen;
                    const idNumber = customer.id_number || customer.CMND_CCCD;
                    
                    return (
                      <MenuItem key={customerId} value={customerId}>
                        {fullName} - {idNumber}
                      </MenuItem>
                    );
                  })}
                </TextField>
                
                {selectedCustomer && (
                  <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'primary.lighter' }}>
                    <Typography variant="body2">
                      <strong>SĐT:</strong> {selectedCustomer.phone || selectedCustomer.SDT}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Địa chỉ:</strong> {selectedCustomer.address || selectedCustomer.DiaChi}
                    </Typography>
                  </Paper>
                )}
              </Grid>

              {/* Vehicle Selection */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Phương tiện"
                  name="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={handleChange}
                  disabled={!formData.customer_id || isEditMode}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CarIcon />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">-- Chọn phương tiện --</MenuItem>
                  {vehicles.map(vehicle => {
                    const vehicleId = vehicle.vehicle_id || vehicle.MaXe;
                    const licensePlate = vehicle.license_plate || vehicle.BienSo;
                    const manufacturer = vehicle.manufacturer || vehicle.HangXe;
                    const model = vehicle.model || vehicle.Model;
                    
                    return (
                      <MenuItem key={vehicleId} value={vehicleId}>
                        {licensePlate} - {manufacturer} {model}
                      </MenuItem>
                    );
                  })}
                </TextField>

                {selectedVehicle && (
                  <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'success.lighter' }}>
                    <Typography variant="body2">
                      <strong>Loại xe:</strong> {selectedVehicle.vehicle_type || selectedVehicle.LoaiXe}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Năm SX:</strong> {selectedVehicle.manufacturing_year || selectedVehicle.NamSX}
                    </Typography>
                  </Paper>
                )}
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Insurance Information */}
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MoneyIcon color="primary" />
              Thông tin bảo hiểm
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Insurance Type */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Loại bảo hiểm"
                  name="insurance_type"
                  value={formData.insurance_type}
                  onChange={handleChange}
                  required
                >
                  {insuranceTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Premium Amount */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Phí bảo hiểm"
                  name="premium_amount"
                  value={formData.premium_amount}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MoneyIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">VNĐ</InputAdornment>
                    ),
                  }}
                  helperText="Số tiền khách hàng phải trả"
                />
              </Grid>

              {/* Coverage Amount */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Số tiền bảo hiểm"
                  name="coverage_amount"
                  value={formData.coverage_amount}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MoneyIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">VNĐ</InputAdornment>
                    ),
                  }}
                  helperText="Số tiền bảo hiểm chi trả khi xảy ra sự cố"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Contract Period */}
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon color="primary" />
              Thời hạn hợp đồng
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Start Date */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Ngày bắt đầu"
                  value={formData.start_date}
                  onChange={handleStartDateChange}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      helperText: 'Ngày bắt đầu có hiệu lực'
                    }
                  }}
                />
              </Grid>

              {/* End Date */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Ngày kết thúc"
                  value={formData.end_date}
                  onChange={(value) => handleDateChange('end_date', value)}
                  format="DD/MM/YYYY"
                  minDate={formData.start_date}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      helperText: 'Ngày hết hiệu lực (tự động +1 năm)'
                    }
                  }}
                />
              </Grid>

              {/* Duration Display */}
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.lighter' }}>
                  <Typography variant="body2">
                    <strong>Thời hạn:</strong> {' '}
                    {formData.start_date && formData.end_date && 
                      `${formData.end_date.diff(formData.start_date, 'day')} ngày 
                      (${formData.end_date.diff(formData.start_date, 'month')} tháng)`
                    }
                  </Typography>
                </Paper>
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
              placeholder="Nhập các ghi chú về hợp đồng (điều khoản đặc biệt, yêu cầu bổ sung...)"
              sx={{ mb: 4 }}
            />

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="ghost"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/contracts')}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                startIcon={<SaveIcon />}
                type="submit"
                loading={loading}
              >
                {isEditMode ? 'Cập nhật' : 'Tạo hợp đồng'}
              </Button>
            </Stack>
          </form>
        </Paper>

        {/* Info Alert */}
        <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            💡 Lưu ý:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Hợp đồng sẽ tự động có hiệu lực từ ngày bắt đầu được chọn</li>
            <li>Thời hạn mặc định là 1 năm kể từ ngày bắt đầu</li>
            <li>Phí bảo hiểm và số tiền bảo hiểm phải lớn hơn 0</li>
            <li>Kiểm tra kỹ thông tin trước khi lưu</li>
          </ul>
        </Alert>
      </Container>
    </LocalizationProvider>
  );
};

export default ContractForm;
