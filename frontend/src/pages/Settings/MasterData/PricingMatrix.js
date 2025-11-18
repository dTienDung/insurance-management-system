import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Collapse
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CalculateIcon from '@mui/icons-material/Calculate';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import pricingMatrixService from '../../../services/pricingMatrixService';

const RISK_LEVELS = [
  { value: 'LOW', label: 'Thấp', color: 'success' },
  { value: 'MEDIUM', label: 'Trung bình', color: 'warning' },
  { value: 'HIGH', label: 'Cao', color: 'error' }
];

const INSURANCE_PACKAGES = [
  { value: 'BASIC', label: 'Cơ bản' },
  { value: 'STANDARD', label: 'Tiêu chuẩn' },
  { value: 'PREMIUM', label: 'Cao cấp' },
  { value: 'VIP', label: 'VIP' }
];

const PricingMatrix = () => {
  const [pricings, setPricings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPricing, setCurrentPricing] = useState(null);
  const [formData, setFormData] = useState({
    RiskLevel: '',
    MaGoi: '',
    HeSoPhi: '',
    GhiChu: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Filters
  const [filterRiskLevel, setFilterRiskLevel] = useState('');
  const [filterPackage, setFilterPackage] = useState('');
  
  // Premium Calculator
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcData, setCalcData] = useState({
    riskLevel: '',
    maGoi: '',
    giaTriXe: ''
  });
  const [calculatedPremium, setCalculatedPremium] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  
  // Matrix View
  const [showMatrix, setShowMatrix] = useState(false);
  const [matrixData, setMatrixData] = useState([]);
  const [matrixLoading, setMatrixLoading] = useState(false);

  useEffect(() => {
    loadPricings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, filterRiskLevel, filterPackage]);

  const loadPricings = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage
      };
      if (filterRiskLevel) params.riskLevel = filterRiskLevel;
      if (filterPackage) params.maGoi = filterPackage;
      
      const data = await pricingMatrixService.getAll(params);
      setPricings(data.data || []);
      setTotalRecords(data.pagination?.totalRecords || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu ma trận định phí');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (pricing = null) => {
    if (pricing) {
      setEditMode(true);
      setCurrentPricing(pricing);
      setFormData({
        RiskLevel: pricing.RiskLevel || '',
        MaGoi: pricing.MaGoi || '',
        HeSoPhi: pricing.HeSoPhi || '',
        GhiChu: pricing.GhiChu || ''
      });
    } else {
      setEditMode(false);
      setCurrentPricing(null);
      setFormData({
        RiskLevel: '',
        MaGoi: '',
        HeSoPhi: '',
        GhiChu: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentPricing(null);
    setFormData({
      RiskLevel: '',
      MaGoi: '',
      HeSoPhi: '',
      GhiChu: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.RiskLevel || !formData.MaGoi || !formData.HeSoPhi) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    const heSoPhi = parseFloat(formData.HeSoPhi);
    if (isNaN(heSoPhi) || heSoPhi < 0.5 || heSoPhi > 5.0) {
      setError('Hệ số phí phải từ 0.5 đến 5.0');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        HeSoPhi: heSoPhi
      };

      if (editMode) {
        await pricingMatrixService.update(currentPricing.ID, dataToSend);
        setSuccess('Cập nhật ma trận định phí thành công');
      } else {
        await pricingMatrixService.create(dataToSend);
        setSuccess('Thêm ma trận định phí thành công');
      }
      
      handleCloseDialog();
      loadPricings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu ma trận định phí');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ma trận định phí này?')) {
      return;
    }

    setLoading(true);
    try {
      await pricingMatrixService.delete(id);
      setSuccess('Xóa ma trận định phí thành công');
      loadPricings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa ma trận định phí');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCalculate = async () => {
    if (!calcData.riskLevel || !calcData.maGoi || !calcData.giaTriXe) {
      setError('Vui lòng nhập đầy đủ thông tin để tính phí');
      return;
    }

    const giaTriXe = parseFloat(calcData.giaTriXe);
    if (isNaN(giaTriXe) || giaTriXe <= 0) {
      setError('Giá trị xe phải là số dương');
      return;
    }

    setCalcLoading(true);
    try {
      const result = await pricingMatrixService.calculatePremium({
        riskLevel: calcData.riskLevel,
        maGoi: calcData.maGoi,
        giaTriXe
      });
      setCalculatedPremium(result);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tính phí bảo hiểm');
      setCalculatedPremium(null);
    } finally {
      setCalcLoading(false);
    }
  };

  const loadMatrix = async () => {
    setMatrixLoading(true);
    try {
      const data = await pricingMatrixService.getMatrix();
      setMatrixData(data);
      setShowMatrix(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải ma trận');
    } finally {
      setMatrixLoading(false);
    }
  };

  const getRiskLevelLabel = (level) => {
    const risk = RISK_LEVELS.find(r => r.value === level);
    return risk ? risk.label : level;
  };

  const getRiskLevelColor = (level) => {
    const risk = RISK_LEVELS.find(r => r.value === level);
    return risk ? risk.color : 'default';
  };

  const getPackageLabel = (pkg) => {
    const packageItem = INSURANCE_PACKAGES.find(p => p.value === pkg);
    return packageItem ? packageItem.label : pkg;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Ma trận Định phí
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<CalculateIcon />}
            onClick={() => setShowCalculator(!showCalculator)}
          >
            Tính phí
          </Button>
          <Button
            variant="outlined"
            startIcon={<ViewModuleIcon />}
            onClick={loadMatrix}
            disabled={matrixLoading}
          >
            Xem ma trận
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm mới
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Premium Calculator */}
      <Collapse in={showCalculator}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalculateIcon />
              Tính phí bảo hiểm
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Mức độ rủi ro</InputLabel>
                  <Select
                    value={calcData.riskLevel}
                    label="Mức độ rủi ro"
                    onChange={(e) => setCalcData({ ...calcData, riskLevel: e.target.value })}
                  >
                    {RISK_LEVELS.map(risk => (
                      <MenuItem key={risk.value} value={risk.value}>{risk.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gói bảo hiểm</InputLabel>
                  <Select
                    value={calcData.maGoi}
                    label="Gói bảo hiểm"
                    onChange={(e) => setCalcData({ ...calcData, maGoi: e.target.value })}
                  >
                    {INSURANCE_PACKAGES.map(pkg => (
                      <MenuItem key={pkg.value} value={pkg.value}>{pkg.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Giá trị xe (VNĐ)"
                  type="number"
                  value={calcData.giaTriXe}
                  onChange={(e) => setCalcData({ ...calcData, giaTriXe: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleCalculate}
                  disabled={calcLoading}
                  sx={{ height: '40px' }}
                >
                  {calcLoading ? <CircularProgress size={24} /> : 'Tính toán'}
                </Button>
              </Grid>
            </Grid>
            
            {calculatedPremium && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Phí bảo hiểm:</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(calculatedPremium.PhiBaoHiem)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Hệ số phí:</Typography>
                    <Typography variant="h6">{calculatedPremium.HeSoPhi}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Tỷ lệ phí cơ bản:</Typography>
                    <Typography variant="h6">{calculatedPremium.TyLePhiCoBan}%</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      </Collapse>

      {/* Filters */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Lọc theo mức rủi ro</InputLabel>
          <Select
            value={filterRiskLevel}
            label="Lọc theo mức rủi ro"
            onChange={(e) => {
              setFilterRiskLevel(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {RISK_LEVELS.map(risk => (
              <MenuItem key={risk.value} value={risk.value}>{risk.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Lọc theo gói</InputLabel>
          <Select
            value={filterPackage}
            label="Lọc theo gói"
            onChange={(e) => {
              setFilterPackage(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {INSURANCE_PACKAGES.map(pkg => (
              <MenuItem key={pkg.value} value={pkg.value}>{pkg.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Data Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Mức độ rủi ro</TableCell>
              <TableCell>Gói bảo hiểm</TableCell>
              <TableCell align="right">Hệ số phí</TableCell>
              <TableCell>Ghi chú</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : pricings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              pricings.map((pricing) => (
                <TableRow key={pricing.ID} hover>
                  <TableCell>{pricing.ID}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRiskLevelLabel(pricing.RiskLevel)}
                      color={getRiskLevelColor(pricing.RiskLevel)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{getPackageLabel(pricing.MaGoi)}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={pricing.HeSoPhi.toFixed(2)}
                      color={pricing.HeSoPhi > 3 ? 'error' : pricing.HeSoPhi > 1.5 ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{pricing.GhiChu}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(pricing)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(pricing.ID)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalRecords}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong tổng số ${count}`}
        />
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Chỉnh sửa ma trận định phí' : 'Thêm ma trận định phí'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Mức độ rủi ro</InputLabel>
              <Select
                name="RiskLevel"
                value={formData.RiskLevel}
                label="Mức độ rủi ro"
                onChange={handleInputChange}
              >
                {RISK_LEVELS.map(risk => (
                  <MenuItem key={risk.value} value={risk.value}>{risk.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth required>
              <InputLabel>Gói bảo hiểm</InputLabel>
              <Select
                name="MaGoi"
                value={formData.MaGoi}
                label="Gói bảo hiểm"
                onChange={handleInputChange}
              >
                {INSURANCE_PACKAGES.map(pkg => (
                  <MenuItem key={pkg.value} value={pkg.value}>{pkg.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              required
              label="Hệ số phí"
              name="HeSoPhi"
              type="number"
              value={formData.HeSoPhi}
              onChange={handleInputChange}
              inputProps={{ min: 0.5, max: 5.0, step: 0.1 }}
              helperText="Nhập từ 0.5 đến 5.0"
            />
            
            <TextField
              fullWidth
              label="Ghi chú"
              name="GhiChu"
              value={formData.GhiChu}
              onChange={handleInputChange}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Matrix View Dialog */}
      <Dialog open={showMatrix} onClose={() => setShowMatrix(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Ma trận Định phí - Tổng quan
        </DialogTitle>
        <DialogContent>
          {matrixLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Mức rủi ro / Gói</TableCell>
                    {INSURANCE_PACKAGES.map(pkg => (
                      <TableCell key={pkg.value} align="center">{pkg.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {RISK_LEVELS.map(risk => (
                    <TableRow key={risk.value}>
                      <TableCell>
                        <Chip label={risk.label} color={risk.color} size="small" />
                      </TableCell>
                      {INSURANCE_PACKAGES.map(pkg => {
                        const item = matrixData.find(
                          m => m.RiskLevel === risk.value && m.MaGoi === pkg.value
                        );
                        return (
                          <TableCell key={pkg.value} align="center">
                            {item ? (
                              <Chip
                                label={item.HeSoPhi.toFixed(2)}
                                color={item.HeSoPhi > 3 ? 'error' : item.HeSoPhi > 1.5 ? 'warning' : 'success'}
                                size="small"
                              />
                            ) : (
                              <Typography variant="body2" color="text.disabled">-</Typography>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMatrix(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PricingMatrix;
