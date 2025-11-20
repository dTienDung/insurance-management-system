import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import assessmentService from '../../services/assessmentService';
import contractService from '../../services/contractService';
import customerService from '../../services/customerService';
import vehicleService from '../../services/vehicleService';
import { CustomerAutocomplete, VehicleAutocomplete, ContractAutocomplete } from '../../components/common/EntityAutocomplete';
import { CONTRACT_STATUS } from '../../config';
import {
  Container,
  Box,
  Paper,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';

const AssessmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contractIdFromQuery = searchParams.get('contract_id');
  
  const [formData, setFormData] = useState({
    assessment_date: new Date().toISOString().split('T')[0],
    assessed_value: '',
    assessor_name: '',
    assessment_method: 'market_value',
    condition_rating: '5',
    notes: '',
    status: 'pending'
  });

  const [contracts, setContracts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedContract, setSelectedContract] = useState(contractIdFromQuery ? { MaHD: contractIdFromQuery } : null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingContracts, setLoadingContracts] = useState(true);

  const isEditMode = !!id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingContracts(true);
        const [contractsRes, customersRes, vehiclesRes] = await Promise.all([
          contractService.getAll(),
          customerService.getAll(),
          vehicleService.getAll()
        ]);

        // Normalize contracts
        let contractList = [];
        if (Array.isArray(contractsRes)) contractList = contractsRes;
        else if (contractsRes && Array.isArray(contractsRes.data)) contractList = contractsRes.data;
        else if (contractsRes && Array.isArray(contractsRes.contracts)) contractList = contractsRes.contracts;
        
        const activeContracts = contractList.filter(c => c.TrangThai === CONTRACT_STATUS.ACTIVE);
        setContracts(activeContracts);

        // Normalize customers
        if (customersRes.data) {
          setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
        } else if (Array.isArray(customersRes)) {
          setCustomers(customersRes);
        }

        // Normalize vehicles
        if (vehiclesRes.data) {
          setVehicles(Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
        } else if (Array.isArray(vehiclesRes)) {
          setVehicles(vehiclesRes);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Lỗi khi tải dữ liệu');
      } finally {
        setLoadingContracts(false);
      }
    };

    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const data = await assessmentService.getById(id);
        setFormData({
          assessment_date: data.assessment_date.split('T')[0],
          assessed_value: data.assessed_value,
          assessor_name: data.assessor_name || '',
          assessment_method: data.assessment_method || 'market_value',
          condition_rating: data.condition_rating || '5',
          notes: data.notes || '',
          status: data.status
        });

        // Set autocomplete values
        const customer = customers.find(c => 
          (c.MaKH || c.customer_id) === (data.MaKH || data.customer_id)
        );
        const vehicle = vehicles.find(v => 
          (v.MaXe || v.vehicle_id) === (data.MaXe || data.vehicle_id)
        );
        const contract = contracts.find(ct => 
          (ct.MaHD || ct.contract_id) === (data.MaHD || data.contract_id)
        );

        setSelectedCustomer(customer || null);
        setSelectedVehicle(vehicle || null);
        setSelectedContract(contract || null);
      } catch (err) {
        setError('Lỗi khi tải thông tin định giá');
        console.error('Error fetching assessment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    if (id) fetchAssessment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Filter vehicles by customer
  const filteredVehicles = selectedCustomer
    ? vehicles.filter(v => 
        (v.MaKH || v.customer_id) === (selectedCustomer.MaKH || selectedCustomer.customer_id)
      )
    : vehicles;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setError('Vui lòng chọn khách hàng');
      return;
    }
    if (!selectedVehicle) {
      setError('Vui lòng chọn xe');
      return;
    }
    if (!formData.assessed_value || parseFloat(formData.assessed_value) <= 0) {
      setError('Vui lòng nhập giá trị định giá hợp lệ');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dataToSubmit = {
        MaKH: selectedCustomer.MaKH || selectedCustomer.customer_id,
        MaXe: selectedVehicle.MaXe || selectedVehicle.vehicle_id,
        MaHD: selectedContract ? (selectedContract.MaHD || selectedContract.contract_id) : null,
        NgayLap: formData.assessment_date,
        PhiDuKien: parseFloat(formData.assessed_value),
        GhiChu: formData.notes,
        TrangThai: formData.status
      };

      if (isEditMode) {
        await assessmentService.update(id, dataToSubmit);
        alert('Cập nhật định giá thành công');
      } else {
        await assessmentService.create(dataToSubmit);
        alert('Tạo định giá mới thành công');
      }
      navigate('/assessments');
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi lưu định giá');
      console.error('Error saving assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingContracts || (isEditMode && loading)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>{isEditMode ? 'Chỉnh sửa định giá' : 'Tạo định giá mới'}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{isEditMode ? 'Cập nhật thông tin định giá' : 'Nhập thông tin định giá phương tiện'}</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Customer Autocomplete */}
          <Grid item xs={12} md={6}>
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
              helperText="Chọn khách hàng cần thẩm định"
              loading={loadingContracts}
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
              helperText={selectedCustomer ? "Chọn xe cần thẩm định" : "Chọn khách hàng trước"}
              loading={loadingContracts}
            />
          </Grid>

          {/* Contract Autocomplete (Optional) */}
          <Grid item xs={12}>
            <ContractAutocomplete
              options={contracts}
              value={selectedContract}
              onChange={(event, newValue) => {
                setSelectedContract(newValue);
                if (error) setError(null);
              }}
              disabled={isEditMode}
              required={false}
              helperText="Tùy chọn - Liên kết với hợp đồng hiện tại (nếu có)"
              loading={loadingContracts}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Ngày định giá *"
              name="assessment_date"
              type="date"
              value={formData.assessment_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: new Date().toISOString().split('T')[0] }}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Người định giá *"
              name="assessor_name"
              value={formData.assessor_name}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Giá trị định giá (VNĐ) *"
              name="assessed_value"
              type="number"
              value={formData.assessed_value}
              onChange={handleChange}
              inputProps={{ min: 0, step: 100000 }}
              required
              fullWidth
            />
            {formData.assessed_value && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>{parseFloat(formData.assessed_value).toLocaleString('vi-VN')} VNĐ</Typography>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="method-label">Phương pháp định giá</InputLabel>
              <Select labelId="method-label" name="assessment_method" value={formData.assessment_method} label="Phương pháp định giá" onChange={handleChange}>
                <MenuItem value="market_value">Giá trị thị trường</MenuItem>
                <MenuItem value="replacement_cost">Chi phí thay thế</MenuItem>
                <MenuItem value="depreciated_value">Giá trị khấu hao</MenuItem>
                <MenuItem value="agreed_value">Giá trị thỏa thuận</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Đánh giá tình trạng (1-10)"
              name="condition_rating"
              type="number"
              value={formData.condition_rating}
              onChange={handleChange}
              inputProps={{ min: 1, max: 10 }}
              fullWidth
            />
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', color: 'text.secondary', fontSize: 12 }}>
              <span>1 (Rất kém)</span>
              <span>5 (Trung bình)</span>
              <span>10 (Xuất sắc)</span>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Trạng thái</InputLabel>
              <Select labelId="status-label" name="status" value={formData.status} label="Trạng thái" onChange={handleChange}>
                <MenuItem value="pending">Chờ xử lý</MenuItem>
                <MenuItem value="approved">Đã duyệt</MenuItem>
                <MenuItem value="rejected">Từ chối</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Ghi chú"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/assessments')}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} color="inherit" /> : (isEditMode ? 'Cập nhật' : 'Tạo mới')}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AssessmentForm;
