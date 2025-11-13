import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Grid,
  Stack,
  Divider,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button as MuiButton,
  Avatar
} from '@mui/material';
import {
  Close as CloseIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Speed as SpeedIcon,
  DateRange as DateIcon,
  AttachMoney as MoneyIcon,
  Build as BuildIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import vehicleService from '../../services/vehicleService';
import { formatDate, formatCurrency } from '../../utils/formatters';

const VehicleDetailModal = ({ open, onClose, vehicleId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vehicleData, setVehicleData] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    if (open && vehicleId) {
      fetchVehicleDetail();
      fetchVehicleHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId, open]);

  const fetchVehicleDetail = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getById(vehicleId);
      setVehicleData(response.data || response);
    } catch (error) {
      console.error('Error fetching vehicle detail:', error);
      alert('Không thể tải thông tin xe');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicleHistory = async () => {
    try {
      const response = await vehicleService.getHistory(vehicleId);
      setHistoryData(response.data || []);
    } catch (error) {
      console.error('Error fetching vehicle history:', error);
      // Không báo lỗi, chỉ để mảng rỗng
      setHistoryData([]);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!vehicleData) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
              <CarIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {vehicleData.HangXe} {vehicleData.LoaiXe}
              </Typography>
              <Chip label={vehicleData.BienSo || 'Chưa có biển số'} color="primary" size="small" />
            </Box>
          </Stack>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ minHeight: 400 }}>
        {/* THÔNG TIN XE */}
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Thông tin xe
        </Typography>
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <CarIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Hãng xe</Typography>
                  <Typography variant="body1" fontWeight={500}>{vehicleData.HangXe || 'N/A'}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <BuildIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Loại xe</Typography>
                  <Typography variant="body1" fontWeight={500}>{vehicleData.LoaiXe || 'N/A'}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <DateIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Năm sản xuất</Typography>
                  <Typography variant="body1" fontWeight={500}>{vehicleData.NamSX || 'N/A'}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <MoneyIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Giá trị xe</Typography>
                  <Typography variant="body1" fontWeight={500} color="primary.main">
                    {vehicleData.GiaTriXe ? formatCurrency(vehicleData.GiaTriXe) : 'N/A'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <SpeedIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Số khung</Typography>
                  <Typography variant="body1" fontWeight={500}>{vehicleData.SoKhung || 'N/A'}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <BuildIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Số máy</Typography>
                  <Typography variant="body1" fontWeight={500}>{vehicleData.SoMay || 'N/A'}</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ my: 3 }} />

        {/* CHỦ XE */}
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Chủ xe
        </Typography>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  {vehicleData.TenChuXe || 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Mã KH: {vehicleData.MaKH || 'N/A'}
                </Typography>
              </Box>
            </Stack>
            <MuiButton
              size="small"
              variant="outlined"
              onClick={() => {
                if (vehicleData.MaKH) {
                  handleClose();
                  navigate(`/customers/${vehicleData.MaKH}`);
                }
              }}
              disabled={!vehicleData.MaKH}
            >
              Xem khách hàng
            </MuiButton>
          </Stack>
        </Paper>

        <Divider sx={{ my: 3 }} />

        {/* LỊCH SỬ XE */}
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Lịch sử xe
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell><strong>Ngày</strong></TableCell>
                <TableCell><strong>Loại sự kiện</strong></TableCell>
                <TableCell><strong>Mô tả</strong></TableCell>
                <TableCell align="center"><strong>Tài liệu</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Chưa có lịch sử
                  </TableCell>
                </TableRow>
              ) : (
                historyData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(item.Ngay)}</TableCell>
                    <TableCell>
                      <Chip label={item.LoaiSuKien} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{item.MoTa}</TableCell>
                    <TableCell align="center">
                      {item.HasDoc ? (
                        <IconButton size="small" color="primary">
                          <DocumentIcon fontSize="small" />
                        </IconButton>
                      ) : (
                        <Typography variant="caption" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
        <MuiButton onClick={handleClose}>Đóng</MuiButton>
      </Box>
    </Dialog>
  );
};

export default VehicleDetailModal;
