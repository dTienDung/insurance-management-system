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
  Avatar,
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
  Button as MuiButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  Description as ContractIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  CreditCard as CardIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import customerService from '../../services/customerService';
import { formatDate, formatPhone, formatCurrency } from '../../utils/formatters';

const CustomerDetailModal = ({ open, onClose, customerId }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState(null);

  useEffect(() => {
    if (open && customerId) {
      fetchCustomerDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, open]);

  const fetchCustomerDetail = async () => {
    try {
      setLoading(true);
      const response = await customerService.getById(customerId);
      setCustomerData(response.data || response);
    } catch (error) {
      console.error('Error fetching customer detail:', error);
      alert('Không thể tải thông tin khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveTab(0);
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

  if (!customerData) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 24 }}>
              {customerData.HoTen?.charAt(0) || 'K'}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {customerData.HoTen}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Mã KH: {customerData.MaKH}
              </Typography>
            </Box>
          </Stack>
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
        <Tab icon={<PersonIcon />} label="Thông tin cá nhân" />
        <Tab icon={<CarIcon />} label="Xe sở hữu" />
        <Tab icon={<ContractIcon />} label="Hợp đồng" />
      </Tabs>

      <DialogContent dividers sx={{ minHeight: 400 }}>
        {/* TAB 1: Thông tin cá nhân */}
        {activeTab === 0 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <PhoneIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Số điện thoại</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formatPhone(customerData.SDT) || 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider />

                    <Stack direction="row" spacing={2} alignItems="center">
                      <EmailIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {customerData.Email || 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider />

                    <Stack direction="row" spacing={2} alignItems="center">
                      <CardIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">CMND/CCCD</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {customerData.CMND_CCCD || 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider />

                    <Stack direction="row" spacing={2} alignItems="center">
                      <PersonIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Ngày sinh</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formatDate(customerData.NgaySinh) || 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider />

                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <HomeIcon color="action" sx={{ mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Địa chỉ</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {customerData.DiaChi || 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Thống kê
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight={700} color="primary.main">
                        {customerData.SoXeSoHuu || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Xe sở hữu</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {customerData.SoHDHieuLuc || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">HĐ hiệu lực</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 2: Danh sách xe */}
        {activeTab === 1 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Danh sách xe sở hữu
              </Typography>
            </Stack>

            {(!customerData.Vehicles || customerData.Vehicles.length === 0) ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <CarIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography color="text.secondary">Chưa có xe nào</Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                      <TableCell><strong>Biển số</strong></TableCell>
                      <TableCell><strong>Loại xe</strong></TableCell>
                      <TableCell><strong>Hãng</strong></TableCell>
                      <TableCell><strong>Năm SX</strong></TableCell>
                      <TableCell align="center"><strong>Thao tác</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(customerData.Vehicles || []).map((vehicle, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip label={vehicle.BienSo || 'N/A'} color="primary" size="small" />
                        </TableCell>
                        <TableCell>{vehicle.LoaiXe || 'N/A'}</TableCell>
                        <TableCell>{vehicle.HangXe || 'N/A'}</TableCell>
                        <TableCell>{vehicle.NamSX || 'N/A'}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              handleClose();
                              navigate(`/vehicles/${vehicle.MaXe}`);
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* TAB 3: Danh sách hợp đồng */}
        {activeTab === 2 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Danh sách hợp đồng
              </Typography>
            </Stack>

            {(!customerData.Contracts || customerData.Contracts.length === 0) ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ContractIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography color="text.secondary">Chưa có hợp đồng nào</Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                      <TableCell><strong>Số HĐ</strong></TableCell>
                      <TableCell><strong>Gói BH</strong></TableCell>
                      <TableCell><strong>Ngày hiệu lực</strong></TableCell>
                      <TableCell><strong>Phí BH</strong></TableCell>
                      <TableCell><strong>Trạng thái</strong></TableCell>
                      <TableCell align="center"><strong>Thao tác</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(customerData.Contracts || []).map((contract, index) => (
                      <TableRow key={index}>
                        <TableCell>{contract.SoHD || contract.MaHD}</TableCell>
                        <TableCell>{contract.TenGoi || 'N/A'}</TableCell>
                        <TableCell>{formatDate(contract.NgayBatDau)}</TableCell>
                        <TableCell>{formatCurrency(contract.PhiBH)}</TableCell>
                        <TableCell>
                          <Chip
                            label={contract.TrangThai || 'N/A'}
                            color={contract.TrangThai === 'ACTIVE' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              handleClose();
                              navigate(`/contracts/${contract.MaHD}`);
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </DialogContent>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
        <MuiButton onClick={handleClose}>Đóng</MuiButton>
      </Box>
    </Dialog>
  );
};

export default CustomerDetailModal;
