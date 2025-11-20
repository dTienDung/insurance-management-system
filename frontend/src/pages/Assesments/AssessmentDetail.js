import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Stack,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon
} from '@mui/icons-material';
import hosoService from '../../services/hosoService';

const AssessmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openReject, setOpenReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [openContractForm, setOpenContractForm] = useState(false);

  useEffect(() => {
    fetchDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchDetail() {
    try {
      setLoading(true);
      const response = await hosoService.getById(id);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin hồ sơ');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async () => {
    if (!window.confirm('Xác nhận duyệt hồ sơ này?')) return;
    try {
      await hosoService.approve(id);
      alert('✅ Đã duyệt hồ sơ thành công');
      setOpenContractForm(true);
    } catch (err) {
      alert('Lỗi: ' + (err.message || err));
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      await hosoService.reject(id, rejectReason);
      alert('✅ Đã từ chối hồ sơ');
      setOpenReject(false);
      navigate('/hoso');
    } catch (err) {
      alert('Lỗi: ' + (err.message || err));
    }
  };

  const handleCreateContract = async () => {
    try {
      const result = await hosoService.lapHopDong(id);
      alert('✅ Đã tạo hợp đồng: ' + result.data.maHD);
      navigate(`/contracts/${result.data.maHD}`);
    } catch (err) {
      alert('Lỗi: ' + (err.message || err));
    }
  };

  const getStatusChip = (status) => {
    const map = {
      'Chờ thẩm định': { color: 'warning', label: 'Chờ thẩm định' },
      'Chấp nhận': { color: 'success', label: 'Đã duyệt' },
      'Từ chối': { color: 'error', label: 'Từ chối' }
    };
    const cfg = map[status] || { color: 'default', label: status };
    return <Chip label={cfg.label} color={cfg.color} />;
  };

  const getRiskLevelChip = (level) => {
    const map = {
      'CHẤP NHẬN': { color: 'success', label: 'CHẤP NHẬN' },
      'XEM XÉT': { color: 'warning', label: 'XEM XÉT' },
      'TỪ CHỐI': { color: 'error', label: 'TỪ CHỐI' }
    };
    const cfg = map[level] || { color: 'default', label: level };
    return <Chip label={cfg.label} color={cfg.color} size="large" />;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/hoso')} sx={{ mt: 2 }}>Quay lại</Button>
      </Container>
    );
  }

  if (!data) return null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Chi tiết hồ sơ thẩm định
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body1" color="text.secondary">
                Mã hồ sơ: <strong>{data.MaHS}</strong>
              </Typography>
              {getStatusChip(data.TrangThai)}
            </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBackIcon />} 
              onClick={() => navigate('/hoso')}
            >
              Quay lại
            </Button>
            
            {data.TrangThai === 'Chờ thẩm định' && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleApprove}
                >
                  Duyệt
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => setOpenReject(true)}
                >
                  Từ chối
                </Button>
              </>
            )}

            {data.TrangThai === 'Chấp nhận' && !data.MaHD && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<DescriptionIcon />}
                onClick={() => setOpenContractForm(true)}
              >
                Lập hợp đồng
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Kết quả thẩm định */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Kết quả thẩm định tự động
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">Điểm rủi ro</Typography>
              <Typography variant="h3" fontWeight="bold" color="primary">
                {data.RiskScore || 0}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary" mb={1}>Mức độ rủi ro</Typography>
              {getRiskLevelChip(data.RiskLevel)}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">Ngày thẩm định</Typography>
              <Typography variant="h6">
                {data.NgayLap ? new Date(data.NgayLap).toLocaleDateString('vi-VN') : '-'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Thông tin khách hàng */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <PersonIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Thông tin khách hàng</Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="body2" color="text.secondary">Mã khách hàng</Typography>
                <Typography variant="body1" fontWeight="500">{data.MaKH}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Họ tên</Typography>
                <Typography variant="body1" fontWeight="500">{data.TenKhach || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Nhân viên lập</Typography>
                <Typography variant="body1" fontWeight="500">{data.MaNV || '-'}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Thông tin xe */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <CarIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Thông tin xe</Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="body2" color="text.secondary">Mã xe</Typography>
                <Typography variant="body1" fontWeight="500">{data.MaXe}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Biển số</Typography>
                <Typography variant="body1" fontWeight="500">{data.BienSo || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Loại xe</Typography>
                <Typography variant="body1" fontWeight="500">{data.LoaiXe || '-'}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Chi tiết thẩm định theo tiêu chí */}
        {data.ChiTiet && data.ChiTiet.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Chi tiết đánh giá theo tiêu chí
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Tiêu chí</strong></TableCell>
                      <TableCell><strong>Mức độ</strong></TableCell>
                      <TableCell align="right"><strong>Điểm</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.ChiTiet.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.TenTieuChi || item.MaTieuChi}</TableCell>
                        <TableCell>{item.MucDo}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={item.Diem} 
                            color={item.Diem > 5 ? 'error' : item.Diem > 3 ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Dialog từ chối */}
      <Dialog open={openReject} onClose={() => setOpenReject(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Từ chối hồ sơ thẩm định</DialogTitle>
        <DialogContent>
          <TextField
            label="Lý do từ chối"
            multiline
            rows={4}
            fullWidth
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối hồ sơ..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReject(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleReject}>
            Xác nhận từ chối
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog lập hợp đồng */}
      <Dialog open={openContractForm} onClose={() => setOpenContractForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Lập hợp đồng bảo hiểm</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            Hồ sơ đã được duyệt. Nhấn "Tạo hợp đồng" để chuyển sang trang tạo hợp đồng mới.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenContractForm(false)}>Đóng</Button>
          <Button variant="contained" color="primary" onClick={handleCreateContract}>
            Tạo hợp đồng
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssessmentDetail;
