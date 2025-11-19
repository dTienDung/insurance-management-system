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
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Typography
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import vehicleService from '../../services/vehicleService';
import customerService from '../../services/customerService';
import CustomerModal from '../Customers/CustomerModal';

const VehicleModal = ({ open, onClose, vehicleId, onSuccess }) => {
  const [formData, setFormData] = useState({
    MaKH: '',
    HangXe: '',
    LoaiXe: 'Sedan',
    NamSX: '',
    SoKhung: '',
    SoMay: '',
    MauXe: '',
    GiaTriXe: '',
    GhiChu: ''
  });
  const [accidents, setAccidents] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCustomers();
      if (vehicleId) {
        fetchVehicle();
      } else {
        resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId, open]);

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAll();
      setCustomers(response.data || response.list || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchVehicle = async () => {
    try {
      const response = await vehicleService.getById(vehicleId);
      const data = response.data || response;
      setFormData({
        MaKH: data.MaKH || '',
        HangXe: data.HangXe || '',
        LoaiXe: data.LoaiXe || '',
        NamSX: data.NamSX || '',
        SoKhung: data.SoKhung || '',
        SoMay: data.SoMay || '',
        MauXe: data.MauXe || '',
        GiaTriXe: data.GiaTriXe || '',
        GhiChu: data.GhiChu || ''
      });
      // TODO: Fetch accident history
      setAccidents([]);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      alert('Không thể tải thông tin xe');
    }
  };

  const resetForm = () => {
    setFormData({
      MaKH: '',
      HangXe: '',
      LoaiXe: 'Sedan',
      NamSX: '',
      SoKhung: '',
      SoMay: '',
      MauXe: '',
      GiaTriXe: '',
      GhiChu: ''
    });
    setAccidents([]);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAddAccident = () => {
    setAccidents(prev => [...prev, {
      NgayXayRa: '',
      MoTa: '',
      ChiPhiSuaChua: '',
      temp_id: Date.now()
    }]);
  };

  const handleAccidentChange = (index, field, value) => {
    setAccidents(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleDeleteAccident = (index) => {
    setAccidents(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.MaKH) newErrors.MaKH = 'Vui lòng chọn khách hàng';
    if (!formData.HangXe.trim()) newErrors.HangXe = 'Vui lòng nhập hãng xe';
    if (!formData.LoaiXe.trim()) newErrors.LoaiXe = 'Vui lòng nhập loại xe';
    if (!formData.NamSX) newErrors.NamSX = 'Vui lòng nhập năm sản xuất';
    
    // LUẬT NGHIỆP VỤ: Năm sản xuất >= 1990 và <= năm hiện tại + 1
    if (formData.NamSX) {
      const currentYear = new Date().getFullYear();
      if (formData.NamSX < 1990) {
        newErrors.NamSX = 'Năm sản xuất phải từ 1990 trở về sau';
      } else if (formData.NamSX > currentYear + 1) {
        newErrors.NamSX = `Năm sản xuất không được vượt quá ${currentYear + 1}`;
      }
    }
    
    if (!formData.SoKhung.trim()) {
      newErrors.SoKhung = 'Vui lòng nhập số khung';
    } else if (formData.SoKhung.trim().length !== 17) {
      // LUẬT NGHIỆP VỤ: VIN phải đúng 17 ký tự
      newErrors.SoKhung = 'Số khung (VIN) phải có đúng 17 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const submitData = {
        maKH: formData.MaKH,
        hangXe: formData.HangXe,
        loaiXe: formData.LoaiXe,
        namSX: parseInt(formData.NamSX),
        soKhung: formData.SoKhung,
        soMay: formData.SoMay,
        mauXe: formData.MauXe,
        giaTriXe: parseFloat(formData.GiaTriXe) || 0,
        ghiChu: formData.GhiChu,
        accidents: accidents.map(a => ({
          ngayXayRa: a.NgayXayRa,
          moTa: a.MoTa,
          chiPhiSuaChua: parseFloat(a.ChiPhiSuaChua) || 0
        }))
      };

      if (vehicleId) {
        await vehicleService.update(vehicleId, submitData);
      } else {
        await vehicleService.create(submitData);
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

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          {vehicleId ? 'Chỉnh sửa xe' : 'Thêm xe mới'}
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
            <Grid item xs={12} sm={6}>
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
                      {c.HoTen} ({c.CMND_CCCD})
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

            {/* Hãng xe */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hãng xe *"
                name="HangXe"
                value={formData.HangXe}
                onChange={handleChange}
                error={!!errors.HangXe}
                helperText={errors.HangXe}
                required
              />
            </Grid>

            {/* Loại xe */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.LoaiXe}>
                <InputLabel>Loại xe *</InputLabel>
                <Select
                  name="LoaiXe"
                  value={formData.LoaiXe}
                  onChange={handleChange}
                  label="Loại xe *"
                >
                  <MenuItem value="Sedan">Xe con (Sedan)</MenuItem>
                  <MenuItem value="Motorcycle">Xe máy</MenuItem>
                  <MenuItem value="Truck">Xe tải</MenuItem>
                  <MenuItem value="Bus">Xe khách</MenuItem>
                  <MenuItem value="Van">Xe van</MenuItem>
                  <MenuItem value="SUV">Xe SUV</MenuItem>
                </Select>
                {errors.LoaiXe && <FormHelperText>{errors.LoaiXe}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Năm sản xuất */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Năm sản xuất *"
                name="NamSX"
                type="number"
                value={formData.NamSX}
                onChange={handleChange}
                error={!!errors.NamSX}
                helperText={errors.NamSX}
                required
              />
            </Grid>

            {/* Số khung */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số khung *"
                name="SoKhung"
                value={formData.SoKhung}
                onChange={handleChange}
                error={!!errors.SoKhung}
                helperText={errors.SoKhung}
                required
              />
            </Grid>

            {/* Số máy */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số máy"
                name="SoMay"
                value={formData.SoMay}
                onChange={handleChange}
              />
            </Grid>

            {/* Màu xe */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Màu xe"
                name="MauXe"
                value={formData.MauXe}
                onChange={handleChange}
              />
            </Grid>

            {/* Giá trị xe */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giá trị xe (VNĐ)"
                name="GiaTriXe"
                type="number"
                value={formData.GiaTriXe}
                onChange={handleChange}
              />
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
                rows={2}
              />
            </Grid>

            {/* Lịch sử tai nạn */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Lịch sử tai nạn
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddAccident}
                    sx={{ ml: 2 }}
                  >
                    Thêm
                  </Button>
                </Typography>
                
                {accidents.length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    Chưa có lịch sử tai nạn
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Ngày xảy ra</TableCell>
                        <TableCell>Mô tả</TableCell>
                        <TableCell>Chi phí sửa chữa</TableCell>
                        <TableCell width={50}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {accidents.map((accident, index) => (
                        <TableRow key={accident.temp_id || index}>
                          <TableCell>
                            <TextField
                              type="date"
                              size="small"
                              value={accident.NgayXayRa}
                              onChange={(e) => handleAccidentChange(index, 'NgayXayRa', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              value={accident.MoTa}
                              onChange={(e) => handleAccidentChange(index, 'MoTa', e.target.value)}
                              placeholder="Mô tả tai nạn"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={accident.ChiPhiSuaChua}
                              onChange={(e) => handleAccidentChange(index, 'ChiPhiSuaChua', e.target.value)}
                              placeholder="VNĐ"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteAccident(index)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Box>
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
            {loading ? 'Đang lưu...' : vehicleId ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal thêm khách hàng */}
      <CustomerModal
        open={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onSuccess={handleCustomerModalSuccess}
      />
    </>
  );
};

export default VehicleModal;
