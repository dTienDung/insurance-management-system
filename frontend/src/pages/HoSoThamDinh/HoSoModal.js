import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import hosoService from '../../services/hosoService';
import customerService from '../../services/customerService';
import vehicleService from '../../services/vehicleService';
import CustomerModal from '../Customers/CustomerModal';
import VehicleModal from '../Vehicles/VehicleModal';

const HoSoModal = ({ open, onClose, hosoId, onSuccess }) => {
  const [formData, setFormData] = useState({
    MaKH: '',
    MaXe: '',
    GhiChu: ''
  });
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCustomers();
      fetchVehicles();
      if (hosoId) {
        fetchHoSo();
      } else {
        resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hosoId, open]);

  // Lọc xe theo khách hàng
  useEffect(() => {
    if (formData.MaKH) {
      const filtered = vehicles.filter(v => v.MaKH === formData.MaKH);
      setFilteredVehicles(filtered);
      // Reset MaXe nếu xe hiện tại không thuộc khách hàng đã chọn
      if (formData.MaXe && !filtered.find(v => v.MaXe === formData.MaXe)) {
        setFormData(prev => ({ ...prev, MaXe: '' }));
      }
    } else {
      setFilteredVehicles(vehicles);
    }
  }, [formData.MaKH, vehicles, formData.MaXe]);

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAll();
      setCustomers(response.data || response.list || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.getAll();
      setVehicles(response.data || response.list || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchHoSo = async () => {
    try {
      const response = await hosoService.getById(hosoId);
      const data = response.data || response;
      setFormData({
        MaKH: data.MaKH || '',
        MaXe: data.MaXe || '',
        GhiChu: data.GhiChu || ''
      });
    } catch (error) {
      console.error('Error fetching hoso:', error);
      alert('Không thể tải thông tin hồ sơ');
    }
  };

  const resetForm = () => {
    setFormData({
      MaKH: '',
      MaXe: '',
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
    if (!formData.MaKH) newErrors.MaKH = 'Vui lòng chọn khách hàng';
    if (!formData.MaXe) newErrors.MaXe = 'Vui lòng chọn xe';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const submitData = {
        MaKH: formData.MaKH,
        MaXe: formData.MaXe,
        GhiChu: formData.GhiChu
      };

      if (hosoId) {
        await hosoService.update(hosoId, submitData);
      } else {
        await hosoService.create(submitData);
        alert('✅ Đã tạo hồ sơ và tự động thẩm định!');
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

  const handleCustomerModalSuccess = () => {
    fetchCustomers();
  };

  const handleVehicleModalSuccess = () => {
    fetchVehicles();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {hosoId ? 'Chỉnh sửa hồ sơ' : 'Thêm hồ sơ thẩm định mới'}
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Chọn khách hàng */}
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.MaKH} required>
                <InputLabel>Khách hàng *</InputLabel>
                <Select
                  name="MaKH"
                  value={formData.MaKH}
                  onChange={handleChange}
                  label="Khách hàng *"
                >
                  {customers.map(c => (
                    <MenuItem key={c.MaKH} value={c.MaKH}>
                      {c.HoTen} - {c.CMND_CCCD} - {c.SDT}
                    </MenuItem>
                  ))}
                </Select>
                {errors.MaKH && <FormHelperText>{errors.MaKH}</FormHelperText>}
              </FormControl>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setCustomerModalOpen(true)}
                sx={{ mt: 0.5 }}
              >
                Thêm khách hàng mới
              </Button>
            </Grid>

            {/* Chọn xe */}
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.MaXe} required disabled={!formData.MaKH}>
                <InputLabel>Xe *</InputLabel>
                <Select
                  name="MaXe"
                  value={formData.MaXe}
                  onChange={handleChange}
                  label="Xe *"
                >
                  {filteredVehicles.length === 0 ? (
                    <MenuItem value="" disabled>
                      {formData.MaKH ? 'Khách hàng chưa có xe nào' : 'Vui lòng chọn khách hàng trước'}
                    </MenuItem>
                  ) : (
                    filteredVehicles.map(v => (
                      <MenuItem key={v.MaXe} value={v.MaXe}>
                        {v.HangXe} {v.LoaiXe} - Số khung: {v.SoKhung} ({v.NamSX})
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.MaXe && <FormHelperText>{errors.MaXe}</FormHelperText>}
              </FormControl>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setVehicleModalOpen(true)}
                sx={{ mt: 0.5 }}
                disabled={!formData.MaKH}
              >
                Thêm xe mới
              </Button>
            </Grid>

            {/* Ghi chú */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú"
                name="GhiChu"
                value={formData.GhiChu}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Ghi chú thêm về hồ sơ..."
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
            {loading ? 'Đang lưu...' : hosoId ? 'Cập nhật' : 'Tạo hồ sơ'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal thêm khách hàng */}
      <CustomerModal
        open={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onSuccess={handleCustomerModalSuccess}
      />

      {/* Modal thêm xe */}
      <VehicleModal
        open={vehicleModalOpen}
        onClose={() => setVehicleModalOpen(false)}
        onSuccess={handleVehicleModalSuccess}
      />
    </>
  );
};

export default HoSoModal;
