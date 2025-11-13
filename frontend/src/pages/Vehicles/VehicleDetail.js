import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import vehicleService from '../../services/vehicleService';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Grid,
  Stack,
  Chip,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchVehicleDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getById(id);
      setVehicle(data.vehicle);
      setCustomer(data.customer);
      setContracts(data.contracts || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải thông tin phương tiện');
      console.error('Error fetching vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/vehicles/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phương tiện này?')) {
      try {
        await vehicleService.delete(id);
        alert('Đã xóa phương tiện thành công');
        navigate('/vehicles');
      } catch (err) {
        alert('Lỗi khi xóa phương tiện: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/vehicles')}
        >
          Quay lại
        </Button>
      </Container>
    );
  }

  if (!vehicle) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Không tìm thấy thông tin phương tiện
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/vehicles')}
        >
          Quay lại
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Chi tiết phương tiện
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Mã xe: {vehicle.vehicle_id || vehicle.MaXe}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/vehicles')}
            >
              Quay lại
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Chỉnh sửa
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Xóa
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab 
            value="info" 
            label="Thông tin xe"
            icon={<CarIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
          />
          <Tab 
            value="owner" 
            label="Chủ sở hữu"
            icon={<PersonIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
          />
          <Tab 
            value="contracts" 
            label={`Hợp đồng (${contracts.length})`}
            icon={<AssignmentIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {activeTab === 'info' && (
        <Paper elevation={1} sx={{ p: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Thông tin cơ bản
              </Typography>
              
              <Stack spacing={3}>
                <Box display="flex" gap={2}>
                  <AssignmentIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Loại xe
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="500">
                      {vehicle.vehicle_type}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <CarIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Hãng xe
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="500">
                      {vehicle.manufacturer}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <AssignmentIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Model
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="500">
                      {vehicle.model}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Thông tin kỹ thuật
              </Typography>
              
              <Stack spacing={3}>
                <Box display="flex" gap={2}>
                  <CalendarIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Năm sản xuất
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="500">
                      {vehicle.manufacturing_year}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <AssignmentIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Số máy
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="500">
                      {vehicle.engine_number}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <AssignmentIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Số khung
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="500">
                      {vehicle.chassis_number}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <CarIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Màu sắc
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="500">
                      {vehicle.color || 'Chưa cập nhật'}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          {vehicle.notes && (
            <Box sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                Ghi chú
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {vehicle.notes}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Ngày đăng ký: {new Date(vehicle.created_at).toLocaleString('vi-VN')}
            </Typography>
            {vehicle.updated_at && (
              <Typography variant="body2" color="text.secondary">
                Cập nhật lần cuối: {new Date(vehicle.updated_at).toLocaleString('vi-VN')}
              </Typography>
            )}
          </Box>
        </Paper>
      )}

      {activeTab === 'owner' && customer && (
        <Paper elevation={1} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Typography variant="h6">Thông tin chủ sở hữu</Typography>
            <Button
              onClick={() => navigate(`/customers/${customer.customer_id}`)}
              color="primary"
              endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
            >
              Xem chi tiết
            </Button>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Box display="flex" gap={2}>
                  <PersonIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Họ và tên
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="500">
                      {customer.full_name}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <AssignmentIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      CCCD/CMND
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="500">
                      {customer.id_number}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <CalendarIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Ngày sinh
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="500">
                      {new Date(customer.date_of_birth).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Box display="flex" gap={2}>
                  <PhoneIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Số điện thoại
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="500">
                      {customer.phone}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <EmailIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="500">
                      {customer.email || 'Chưa cập nhật'}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <HomeIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Địa chỉ
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="500">
                      {customer.address}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}

      {activeTab === 'contracts' && (
        <Paper elevation={1}>
          {contracts.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary" gutterBottom>
                Phương tiện chưa có hợp đồng bảo hiểm nào
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate(`/contracts/new?vehicle_id=${id}`)}
                sx={{ mt: 2 }}
              >
                Tạo hợp đồng
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã HĐ</TableCell>
                    <TableCell>Loại BH</TableCell>
                    <TableCell>Phí BH</TableCell>
                    <TableCell>Hiệu lực</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.contract_id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {contract.contract_number}
                        </Typography>
                      </TableCell>
                      <TableCell>{contract.insurance_type}</TableCell>
                      <TableCell>
                        {parseFloat(contract.premium_amount).toLocaleString('vi-VN')} VNĐ
                      </TableCell>
                      <TableCell>
                        {new Date(contract.start_date).toLocaleDateString('vi-VN')} - {new Date(contract.end_date).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={contract.status === 'active' ? 'Còn hiệu lực' :
                                contract.status === 'expired' ? 'Hết hạn' : 'Đã hủy'}
                          color={contract.status === 'active' ? 'success' :
                                contract.status === 'expired' ? 'error' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="text"
                          color="primary"
                          onClick={() => navigate(`/contracts/${contract.contract_id}`)}
                        >
                          Chi tiết
                        </Button>
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

export default VehicleDetail;
