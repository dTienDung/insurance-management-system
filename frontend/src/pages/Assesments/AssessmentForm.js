import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { assessmentService } from '../../services/assessmentService';
import { contractService } from '../../services/contractService';
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
    contract_id: contractIdFromQuery || '',
    assessment_date: new Date().toISOString().split('T')[0],
    assessed_value: '',
    assessor_name: '',
    assessment_method: 'market_value',
    condition_rating: '5',
    notes: '',
    status: 'pending'
  });

  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingContracts, setLoadingContracts] = useState(true);

  const isEditMode = !!id;

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoadingContracts(true);
        const data = await contractService.getAll();
        const activeContracts = data.filter(c => c.status === 'active');
        setContracts(activeContracts);
      } catch (err) {
        console.error('Error fetching contracts:', err);
        setError('Lỗi khi tải danh sách hợp đồng');
      } finally {
        setLoadingContracts(false);
      }
    };

    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const data = await assessmentService.getById(id);
        setFormData({
          contract_id: data.contract_id,
          assessment_date: data.assessment_date.split('T')[0],
          assessed_value: data.assessed_value,
          assessor_name: data.assessor_name || '',
          assessment_method: data.assessment_method || 'market_value',
          condition_rating: data.condition_rating || '5',
          notes: data.notes || '',
          status: data.status
        });
      } catch (err) {
        setError('Lỗi khi tải thông tin định giá');
        console.error('Error fetching assessment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
    if (id) fetchAssessment();
  }, [id]);

  useEffect(() => {
    if (formData.contract_id) {
      const contract = contracts.find(c => c.contract_id === parseInt(formData.contract_id));
      setSelectedContract(contract);
    }
  }, [formData.contract_id, contracts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.contract_id) {
      setError('Vui lòng chọn hợp đồng');
      return;
    }
    if (!formData.assessed_value || parseFloat(formData.assessed_value) <= 0) {
      setError('Vui lòng nhập giá trị định giá hợp lệ');
      return;
    }
    if (!formData.assessor_name.trim()) {
      setError('Vui lòng nhập tên người định giá');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dataToSubmit = {
        ...formData,
        assessed_value: parseFloat(formData.assessed_value),
        condition_rating: parseInt(formData.condition_rating)
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
          <Grid item xs={12}>
            <FormControl fullWidth disabled={isEditMode}>
              <InputLabel id="contract-label">Hợp đồng *</InputLabel>
              <Select
                labelId="contract-label"
                name="contract_id"
                value={formData.contract_id}
                label="Hợp đồng *"
                onChange={handleChange}
              >
                <MenuItem value="">-- Chọn hợp đồng --</MenuItem>
                {contracts.map(contract => (
                  <MenuItem key={contract.contract_id} value={contract.contract_id}>
                    {`${contract.contract_number} - ${contract.customer_name} - ${contract.license_plate}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedContract && (
              <Paper sx={{ mt: 2, p: 2, backgroundColor: 'info.light' }}>
                <Typography variant="body2"><strong>Khách hàng:</strong> {selectedContract.customer_name}</Typography>
                <Typography variant="body2"><strong>Phương tiện:</strong> {selectedContract.license_plate} - {selectedContract.vehicle_type}</Typography>
                <Typography variant="body2"><strong>Số tiền bảo hiểm:</strong> {parseFloat(selectedContract.coverage_amount).toLocaleString('vi-VN')} VNĐ</Typography>
              </Paper>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Ngày định giá"
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
              label="Người định giá"
              name="assessor_name"
              value={formData.assessor_name}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Giá trị định giá (VNĐ)"
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
