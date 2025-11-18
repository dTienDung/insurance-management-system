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
  Divider,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  Info as InfoIcon,
  Person as PersonIcon,
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
import packageService from '../../services/packageService';
import Button from '../../components/common/Button';
import { CustomerAutocomplete, VehicleAutocomplete, PackageAutocomplete } from '../../components/common/EntityAutocomplete';
import EnumSelect from '../../components/common/EnumSelect';
import { PAYMENT_METHOD_OPTIONS } from '../../config';

const ContractForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerIdFromQuery = searchParams.get('customer_id');
  const vehicleIdFromQuery = searchParams.get('vehicle_id');
  
  const [formData, setFormData] = useState({
    MaHD: '', // Display only, auto-generated
    NgayKy: dayjs(),
    NgayHetHan: dayjs().add(1, 'year'),
    PhiBaoHiem: '',
    HinhThucThanhToan: '', // Payment method (optional)
    GhiChu: ''
  });

  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(customerIdFromQuery ? { MaKH: customerIdFromQuery } : null);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleIdFromQuery ? { MaXe: vehicleIdFromQuery } : null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const isEditMode = !!id;

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (id) {
      fetchContract();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Filter vehicles by selected customer
  const filteredVehicles = selectedCustomer 
    ? vehicles.filter(v => 
        (v.MaKH || v.customer_id) === (selectedCustomer.MaKH || selectedCustomer.customer_id)
      )
    : vehicles;

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      const [customersRes, vehiclesRes] = await Promise.all([
        customerService.getAll(),
        vehicleService.getAll()
      ]);
      
      console.log('Customers:', customersRes);
      console.log('Vehicles:', vehiclesRes);
      
      if (customersRes.data) {
        setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
      } else if (Array.isArray(customersRes)) {
        setCustomers(customersRes);
      }

      if (vehiclesRes.data) {
        setVehicles(Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
      } else if (Array.isArray(vehiclesRes)) {
        setVehicles(vehiclesRes);
      }

      // Load packages (active only)
      const packagesRes = await packageService.getActive();
      if (packagesRes.data) {
        setPackages(Array.isArray(packagesRes.data) ? packagesRes.data : []);
      } else if (Array.isArray(packagesRes)) {
        setPackages(packagesRes);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Lỗi khi tải dữ liệu');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await contractService.getById(id);
      console.log('Contract data:', response);
      
      const contract = response.data || response.contract || response;
      
      setFormData({
        MaHD: contract.MaHD || contract.contract_id || '',
        NgayKy: contract.NgayKy || contract.start_date ? 
          dayjs(contract.NgayKy || contract.start_date) : dayjs(),
        NgayHetHan: contract.NgayHetHan || contract.end_date ? 
          dayjs(contract.NgayHetHan || contract.end_date) : dayjs().add(1, 'year'),
        PhiBaoHiem: contract.PhiBaoHiem || contract.premium_amount || '',
        HinhThucThanhToan: contract.HinhThucThanhToan || '',
        GhiChu: contract.GhiChu || contract.notes || ''
      });

      // Set autocomplete values
      const customer = customers.find(c => 
        (c.MaKH || c.customer_id) === (contract.MaKH || contract.customer_id)
      );
      const vehicle = vehicles.find(v => 
        (v.MaXe || v.vehicle_id) === (contract.MaXe || contract.vehicle_id)
      );
      const pkg = packages.find(p => 
        (p.MaGoi || p.package_id) === (contract.MaGoi || contract.package_id)
      );

      setSelectedCustomer(customer || null);
      setSelectedVehicle(vehicle || null);
      setSelectedPackage(pkg || null);
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

  // const calculateEndDate = (startDate) => {
  //   return dayjs(startDate).add(1, 'year');
  // };

  const validateForm = () => {
    const errors = [];

    if (!selectedCustomer) errors.push('Vui lòng chọn khách hàng');
    if (!selectedVehicle) errors.push('Vui lòng chọn phương tiện');
    if (!selectedPackage) errors.push('Vui lòng chọn gói bảo hiểm');
    if (!formData.PhiBaoHiem || parseFloat(formData.PhiBaoHiem) <= 0) {
      errors.push('Phí bảo hiểm phải lớn hơn 0');
    }
    if (!formData.NgayKy) errors.push('Vui lòng chọn ngày ký');
    if (!formData.NgayHetHan) errors.push('Vui lòng chọn ngày hết hạn');
    
    if (formData.NgayKy && formData.NgayHetHan) {
      if (dayjs(formData.NgayHetHan).isBefore(dayjs(formData.NgayKy))) {
        errors.push('Ngày hết hạn phải sau ngày ký');
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
        MaKH: selectedCustomer.MaKH || selectedCustomer.customer_id,
        MaXe: selectedVehicle.MaXe || selectedVehicle.vehicle_id,
        MaGoi: selectedPackage.MaGoi || selectedPackage.package_id,
        NgayKy: formData.NgayKy.format('YYYY-MM-DD'),
        NgayHetHan: formData.NgayHetHan.format('YYYY-MM-DD'),
        PhiBaoHiem: parseFloat(formData.PhiBaoHiem),
        HinhThucThanhToan: formData.HinhThucThanhToan || null,
        GhiChu: formData.GhiChu
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
              {/* MaHD - Display Only */}
              {formData.MaHD && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mã hợp đồng"
                    value={formData.MaHD}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <InfoIcon />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Mã hợp đồng tự động tạo"
                  />
                </Grid>
              )}

              {/* Customer Autocomplete */}
              <Grid item xs={12} md={formData.MaHD ? 6 : 12}>
                <CustomerAutocomplete
                  options={customers}
                  value={selectedCustomer}
                  onChange={(event, newValue) => {
                    setSelectedCustomer(newValue);
                    // Reset vehicle when customer changes
                    if (!newValue) {
                      setSelectedVehicle(null);
                    }
                    if (error) setError(null);
                  }}
                  disabled={isEditMode}
                  required
                  helperText="Chọn khách hàng tham gia hợp đồng"
                  loading={loadingData}
                />
              </Grid>

              {/* Vehicle Autocomplete */}
              <Grid item xs={12} md={6}>
                <VehicleAutocomplete
                  options={filteredVehicles}
                  value={selectedVehicle}
                  onChange={(event, newValue) => {
                    setSelectedVehicle(newValue);
                    if (error) setError(null);
                  }}
                  disabled={!selectedCustomer || isEditMode}
                  required
                  helperText={selectedCustomer ? "Chọn xe của khách hàng" : "Chọn khách hàng trước"}
                  loading={loadingData}
                />
              </Grid>

              {/* Package Autocomplete */}
              <Grid item xs={12} md={6}>
                <PackageAutocomplete
                  options={packages}
                  value={selectedPackage}
                  onChange={(event, newValue) => {
                    setSelectedPackage(newValue);
                    if (error) setError(null);
                  }}
                  disabled={isEditMode}
                  required
                  helperText="Chọn gói bảo hiểm"
                  loading={loadingData}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Insurance Information */}
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MoneyIcon color="primary" />
              Thông tin bảo hiểm
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Payment Method (Optional) */}
              <Grid item xs={12} md={6}>
                <EnumSelect
                  name="HinhThucThanhToan"
                  label="Hình thức thanh toán"
                  value={formData.HinhThucThanhToan}
                  onChange={handleChange}
                  options={PAYMENT_METHOD_OPTIONS}
                  required={false}
                  helperText="Tùy chọn - Có thể thanh toán sau"
                />
              </Grid>

              {/* Premium Amount */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Phí bảo hiểm *"
                  name="PhiBaoHiem"
                  value={formData.PhiBaoHiem}
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
                  label="Ngày ký"
                  value={formData.NgayKy}
                  onChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      NgayKy: value,
                      NgayHetHan: value ? dayjs(value).add(1, 'year') : prev.NgayHetHan
                    }));
                  }}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      helperText: 'Ngày ký hợp đồng'
                    }
                  }}
                />
              </Grid>

              {/* End Date */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Ngày hết hạn"
                  value={formData.NgayHetHan}
                  onChange={(value) => setFormData(prev => ({ ...prev, NgayHetHan: value }))}
                  format="DD/MM/YYYY"
                  minDate={formData.NgayKy}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      helperText: 'Ngày hết hạn hợp đồng (tự động +1 năm)'
                    }
                  }}
                />
              </Grid>

              {/* Duration Display */}
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.lighter' }}>
                  <Typography variant="body2">
                    <strong>Thời hạn:</strong> {' '}
                    {formData.NgayKy && formData.NgayHetHan && 
                      `${formData.NgayHetHan.diff(formData.NgayKy, 'day')} ngày 
                      (${formData.NgayHetHan.diff(formData.NgayKy, 'month')} tháng)`
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
              name="GhiChu"
              value={formData.GhiChu}
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
            <li>Mã hợp đồng (MaHD) tự động tạo theo dịnh dạng HD-YYYYMMDD-XXXX</li>
            <li>Trạng thái mặc định là 'DRAFT' khi tạo mới</li>
            <li>Thời hạn mặc định là 1 năm kể từ ngày ký</li>
            <li>Phí bảo hiểm phải lớn hơn 0</li>
            <li>Kiểm tra kỹ thông tin trước khi lưu</li>
          </ul>
        </Alert>
      </Container>
    </LocalizationProvider>
  );
};

export default ContractForm;
