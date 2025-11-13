import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import customerService from '../../services/customerService';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  DirectionsCar as CarIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchCustomerDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const response = await customerService.getById(id);
      const customerData = response.data;

      setCustomer({
        customer_id: customerData.MaKH,
        full_name: customerData.HoTen,
        id_number: customerData.CMND_CCCD,
        date_of_birth: customerData.NgaySinh,
        address: customerData.DiaChi,
        phone: customerData.SDT,
        email: customerData.Email,
        notes: customerData.GhiChu,
        created_at: customerData.NgayTao,
        updated_at: customerData.NgayCapNhat
      });

      // Keep placeholders; backend endpoints for vehicles/contracts can be added later
      setVehicles([]);
      setContracts([]);
      setError(null);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải thông tin khách hàng');
      console.error('Error fetching customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => navigate(`/customers/edit/${id}`);

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      try {
        await customerService.delete(id);
        alert('Đã xóa khách hàng thành công');
        navigate('/customers');
      } catch (err) {
        alert('Lỗi khi xóa khách hàng: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/customers')}>Quay lại</Button>
      </Container>
    );
  }

  if (!customer) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Không tìm thấy thông tin khách hàng</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={700}>Chi tiết khách hàng</Typography>
            <Typography color="text.secondary">Mã KH: {customer.customer_id}</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/customers')}>Quay lại</Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit}>Chỉnh sửa</Button>
            <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>Xóa</Button>
          </Stack>
        </Stack>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab value="info" label="Thông tin cơ bản" icon={<PersonIcon />} iconPosition="start" />
          <Tab value="vehicles" label={`Phương tiện (${vehicles.length})`} icon={<CarIcon />} iconPosition="start" />
          <Tab value="contracts" label={`Hợp đồng (${contracts.length})`} icon={<AssignmentIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {activeTab === 'info' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Thông tin cá nhân</Typography>
              <Stack spacing={2}>
                <Box display="flex" gap={2}>
                  <PersonIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Họ và tên</Typography>
                    <Typography variant="subtitle1" fontWeight={500}>{customer.full_name}</Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <BadgeIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">CMND/CCCD</Typography>
                    <Typography variant="subtitle1" fontWeight={500}>{customer.id_number}</Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <CalendarIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Ngày sinh</Typography>
                    <Typography variant="subtitle1" fontWeight={500}>{new Date(customer.date_of_birth).toLocaleDateString('vi-VN')}</Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Thông tin liên hệ</Typography>
              <Stack spacing={2}>
                <Box display="flex" gap={2}>
                  <PhoneIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Số điện thoại</Typography>
                    <Typography variant="subtitle1" fontWeight={500}>{customer.phone}</Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <EmailIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="subtitle1" fontWeight={500}>{customer.email || 'Chưa cập nhật'}</Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <HomeIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Địa chỉ</Typography>
                    <Typography variant="subtitle1" fontWeight={500}>{customer.address}</Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          {customer.notes && (
            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>Ghi chú</Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{customer.notes}</Typography>
            </Box>
          )}

          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">Ngày tạo: {new Date(customer.created_at).toLocaleString('vi-VN')}</Typography>
            {customer.updated_at && (
              <Typography variant="body2" color="text.secondary">Cập nhật lần cuối: {new Date(customer.updated_at).toLocaleDateString('vi-VN')}</Typography>
            )}
          </Box>
        </Paper>
      )}

      {activeTab === 'vehicles' && (
        <Paper sx={{ p: 2, mb: 3 }}>
          {vehicles.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography color="text.secondary">Khách hàng chưa có phương tiện nào</Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(`/vehicles/new?customer_id=${id}`)}>Thêm phương tiện</Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Biển số</TableCell>
                    <TableCell>Loại xe</TableCell>
                    <TableCell>Hãng</TableCell>
                    <TableCell>Năm SX</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicles.map((v) => (
                    <TableRow key={v.vehicle_id} hover>
                      <TableCell>{v.license_plate}</TableCell>
                      <TableCell>{v.vehicle_type}</TableCell>
                      <TableCell>{v.manufacturer}</TableCell>
                      <TableCell>{v.manufacturing_year}</TableCell>
                      <TableCell>
                        <Button variant="text" onClick={() => navigate(`/vehicles/${v.vehicle_id}`)}>Chi tiết</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {activeTab === 'contracts' && (
        <Paper sx={{ p: 2 }}>
          {contracts.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography color="text.secondary">Khách hàng chưa có hợp đồng nào</Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(`/contracts/new?customer_id=${id}`)}>Tạo hợp đồng</Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã HĐ</TableCell>
                    <TableCell>Biển số xe</TableCell>
                    <TableCell>Loại BH</TableCell>
                    <TableCell>Hiệu lực</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contracts.map((c) => (
                    <TableRow key={c.contract_id} hover>
                      <TableCell>{c.contract_number}</TableCell>
                      <TableCell>{c.license_plate}</TableCell>
                      <TableCell>{c.insurance_type}</TableCell>
                      <TableCell>{new Date(c.start_date).toLocaleDateString('vi-VN')} - {new Date(c.end_date).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>
                        <Chip label={c.status === 'active' ? 'Còn hiệu lực' : c.status === 'expired' ? 'Hết hạn' : 'Đã hủy'}
                          color={c.status === 'active' ? 'success' : c.status === 'expired' ? 'error' : 'default'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Button variant="text" onClick={() => navigate(`/contracts/${c.contract_id}`)}>Chi tiết</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default CustomerDetail;