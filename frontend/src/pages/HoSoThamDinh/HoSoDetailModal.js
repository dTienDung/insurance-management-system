import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Info as InfoIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import hosoService from '../../services/hosoService';
import { formatDate, formatCurrency } from '../../utils/formatters';

const HoSoDetailModal = ({ open, onClose, hosoId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hosoData, setHosoData] = useState(null);

  useEffect(() => {
    if (open && hosoId) {
      fetchHoSoDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hosoId, open]);

  const fetchHoSoDetail = async () => {
    try {
      setLoading(true);
      const response = await hosoService.getById(hosoId);
      setHosoData(response.data || response);
    } catch (error) {
      console.error('Error fetching hoso detail:', error);
      alert('Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveTab(0);
    onClose();
  };

  const getRiskLevelChip = (level) => {
    const map = {
      'CHẤP NHẬN': { color: 'success', icon: <CheckCircleIcon />, label: 'Chấp nhận' },
      'XEM XÉT': { color: 'warning', icon: <WarningIcon />, label: 'Xem xét' },
      'TỪ CHỐI': { color: 'error', icon: <CancelIcon />, label: 'Từ chối' }
    };
    const cfg = map[level] || { color: 'default', icon: <InfoIcon />, label: level };
    return (
      <Chip
        icon={cfg.icon}
        label={cfg.label}
        color={cfg.color}
        sx={{ fontWeight: 600 }}
      />
    );
  };

  const getStatusChip = (status) => {
    const map = {
      'Chờ thẩm định': { color: 'warning', label: 'Chờ thẩm định' },
      'Đã thẩm định': { color: 'success', label: 'Đã thẩm định' },
      'Từ chối': { color: 'error', label: 'Từ chối' }
    };
    const cfg = map[status] || { color: 'default', label: status };
    return <Chip label={cfg.label} color={cfg.color} size="small" />;
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

  if (!hosoData) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Chi tiết hồ sơ: {hosoData.MaHS}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getStatusChip(hosoData.TrangThai)}
            </Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
      >
        <Tab icon={<InfoIcon />} label="Thông tin chung" />
        <Tab icon={<AssessmentIcon />} label="Kết quả thẩm định" disabled={!hosoData.RiskLevel} />
      </Tabs>

      <DialogContent dividers sx={{ minHeight: 400 }}>
        {/* TAB 1: Thông tin chung */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Thông tin khách hàng
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Tên khách hàng</Typography>
                <Typography variant="body1" fontWeight={500}>{hosoData.TenKhach || hosoData.MaKH}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Mã khách hàng</Typography>
                <Typography variant="body1">{hosoData.MaKH}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Thông tin xe
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Biển số</Typography>
                <Chip label={hosoData.BienSo || 'N/A'} color="primary" size="small" />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Mã xe</Typography>
                <Typography variant="body1">{hosoData.MaXe}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Loại xe</Typography>
                <Typography variant="body1">{hosoData.LoaiXe || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Hãng xe</Typography>
                <Typography variant="body1">{hosoData.HangXe || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Năm sản xuất</Typography>
                <Typography variant="body1">{hosoData.NamSanXuat || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Giá trị xe</Typography>
                <Typography variant="body1" fontWeight={600} color="primary.main">
                  {hosoData.GiaTriXe ? formatCurrency(hosoData.GiaTriXe) : 'N/A'}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Thông tin hồ sơ
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Ngày lập</Typography>
                <Typography variant="body1">{formatDate(hosoData.NgayLap)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                {getStatusChip(hosoData.TrangThai)}
              </Grid>
              {hosoData.GhiChu && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Ghi chú</Typography>
                  <Typography variant="body1">{hosoData.GhiChu}</Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* TAB 2: Kết quả thẩm định */}
        {activeTab === 1 && hosoData.RiskLevel && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Kết quả đánh giá
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Mức độ rủi ro</Typography>
                <Box sx={{ mt: 1 }}>
                  {getRiskLevelChip(hosoData.RiskLevel)}
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Điểm rủi ro</Typography>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {hosoData.RiskScore || 0}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Hệ số phí dự kiến</Typography>
                <Typography variant="h6" fontWeight={600}>
                  {hosoData.HeSoPhi ? `×${hosoData.HeSoPhi}` : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Phí bảo hiểm dự kiến</Typography>
                <Typography variant="h6" fontWeight={600} color="success.main">
                  {hosoData.PhiDuKien ? formatCurrency(hosoData.PhiDuKien) : 'N/A'}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Bảng chấm điểm chi tiết
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>Tiêu chí</strong></TableCell>
                    <TableCell><strong>Mô tả</strong></TableCell>
                    <TableCell align="center"><strong>Điểm</strong></TableCell>
                    <TableCell><strong>Nhận xét</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hosoData.ChiTietDiem && hosoData.ChiTietDiem.length > 0 ? (
                    <>
                      {hosoData.ChiTietDiem.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.TenTieuChi || 'N/A'}</TableCell>
                          <TableCell>{item.MoTaTieuChi || 'N/A'}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={item.Diem || 0} 
                              size="small" 
                              color={item.Diem > 50 ? 'error' : item.Diem > 30 ? 'warning' : 'success'} 
                            />
                          </TableCell>
                          <TableCell>{item.GhiChu || '-'}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: 'primary.lighter' }}>
                        <TableCell colSpan={2}><strong>Tổng điểm</strong></TableCell>
                        <TableCell align="center">
                          <Chip label={hosoData.RiskScore || 0} size="small" color="primary" />
                        </TableCell>
                        <TableCell><strong>{hosoData.RiskLevel}</strong></TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Chưa có dữ liệu chấm điểm chi tiết
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {hosoData.KetQua && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Ghi chú underwriter
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2">
                    {hosoData.KetQua}
                  </Typography>
                </Paper>
              </>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HoSoDetailModal;
