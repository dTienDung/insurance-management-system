import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import contractService from '../../services/contractService';
import PaymentModal from '../../components/common/PaymentModal';
import {
  Container,
  Box,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalAtm as BanknotesIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as XCircleIcon,
  DirectionsCar as TruckIcon,
  Person as UserIcon,
  CalendarToday as CalendarIcon,
  MonetizationOn as CurrencyDollarIcon,
  Description as ClipboardDocumentListIcon
} from '@mui/icons-material';

const ContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        setLoading(true);
        const data = await contractService.getById(id);
        setContract(data.contract);
        setCustomer(data.customer);
        setVehicle(data.vehicle);
        setAssessments(data.assessments || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Lỗi khi tải thông tin hợp đồng');
        console.error('Error fetching contract:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContractDetails();
  }, [id]);

  const handleEdit = () => navigate(`/contracts/edit/${id}`);

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) return;
    try {
      await contractService.delete(id);
      alert('Đã xóa hợp đồng thành công');
      navigate('/contracts');
    } catch (err) {
      alert('Lỗi khi xóa hợp đồng: ' + err.message);
    }
  };

  // PAYMENT HANDLERS
  const handleConfirmPayment = async (paymentData) => {
    try {
      await contractService.updatePaymentStatus(id, paymentData);
      setContract(prev => ({
        ...prev,
        payment_status: 'paid',
        payment_date: paymentData.payment_date,
        payment_method: paymentData.payment_method,
        payment_notes: paymentData.payment_notes
      }));
      alert('✅ Đã cập nhật trạng thái thanh toán thành công!');
      setShowPaymentModal(false);
    } catch (err) {
      alert('Lỗi khi cập nhật thanh toán: ' + err.message);
    }
  };

  const handlePrintReceipt = async () => {
    try {
      // Giả sử lấy payment ID từ contract data
      const paymentId = contract.MaTT || contract.payment_id;
      if (!paymentId) {
        alert('Không tìm thấy thông tin thanh toán');
        return;
      }
      await contractService.downloadReceipt(paymentId);
    } catch (err) {
      alert('Lỗi khi tải biên lai: ' + (err.message || err));
    }
  };

  const handleExportContract = async () => {
    try {
      await contractService.downloadContract(id);
    } catch (err) {
      alert('Lỗi khi tải hợp đồng: ' + (err.message || err));
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      await contractService.downloadCertificate(id);
    } catch (err) {
      alert('Lỗi khi tải giấy chứng nhận: ' + (err.message || err));
    }
  };

  const getStatusChip = (status) => {
    const map = {
      active: { color: 'success', label: 'Còn hiệu lực' },
      expired: { color: 'error', label: 'Hết hạn' },
      cancelled: { color: 'default', label: 'Đã hủy' }
    };
    const cfg = map[status] || map.cancelled;
    return <Chip label={cfg.label} color={cfg.color} size="small" />;
  };

  const getPaymentChip = (status) => {
    return status === 'paid'
      ? <Chip icon={<CheckCircleIcon />} label="Đã thanh toán" color="success" size="small" />
      : <Chip icon={<XCircleIcon />} label="Chưa thanh toán" color="warning" size="small" />;
  };

  const getAssessmentChip = (status) => {
    const map = {
      pending: { color: 'warning', label: 'Chờ xử lý' },
      approved: { color: 'success', label: 'Đã duyệt' },
      rejected: { color: 'error', label: 'Từ chối' }
    };
    const cfg = map[status] || map.pending;
    return <Chip label={cfg.label} color={cfg.color} size="small" />;
  };

  const getPaymentMethodLabel = (method) => {
    const methods = { cash: 'Tiền mặt', transfer: 'Chuyển khoản', card: 'Thẻ ngân hàng' };
    return methods[method] || method || '-';
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
  );

  if (error) return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Typography color="error">Lỗi: {error}</Typography>
        <Button startIcon={<ArrowBackIcon />} sx={{ mt: 1 }} onClick={() => navigate('/contracts')}>Quay lại</Button>
      </Paper>
    </Container>
  );

  if (!contract) return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Alert severity="warning">Không tìm thấy thông tin hợp đồng</Alert>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" fontWeight={700}>Chi tiết hợp đồng</Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
              <Typography color="text.secondary">Mã HĐ: {contract.contract_number}</Typography>
              {getStatusChip(contract.status)}
              {getPaymentChip(contract.payment_status)}
            </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/contracts')}>Quay lại</Button>
            <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={handleDownloadCertificate}>Giấy chứng nhận</Button>
            <Button variant="contained" color="secondary" startIcon={<PrintIcon />} onClick={handleExportContract}>Hợp đồng</Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit}>Chỉnh sửa</Button>
            <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>Xóa</Button>
          </Stack>
        </Stack>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} textColor="primary" indicatorColor="primary">
          <Tab value="info" label="Thông tin hợp đồng" />
          <Tab value="payment" label="Thanh toán" />
          <Tab value="parties" label="Bên liên quan" />
          <Tab value="assessments" label={`Định giá (${assessments.length})`} />
        </Tabs>
      </Paper>

      {/* Info Tab */}
      {activeTab === 'info' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Thông tin cơ bản</Typography>
              <Stack spacing={2}>
                <Box display="flex" gap={2}>
                  <ClipboardDocumentListIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Số hợp đồng</Typography>
                    <Typography variant="subtitle1" fontWeight={500}>{contract.contract_number}</Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <ClipboardDocumentListIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Loại bảo hiểm</Typography>
                    <Typography variant="subtitle1" fontWeight={500}>{contract.insurance_type}</Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <CurrencyDollarIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Phí bảo hiểm</Typography>
                    <Typography variant="subtitle1" fontWeight={700} color="success.main">{parseFloat(contract.premium_amount || 0).toLocaleString('vi-VN')} VNĐ</Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <CurrencyDollarIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Số tiền bảo hiểm</Typography>
                    <Typography variant="subtitle1" fontWeight={700} color="primary.main">{parseFloat(contract.coverage_amount || 0).toLocaleString('vi-VN')} VNĐ</Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Thời hạn</Typography>
              <Stack spacing={2}>
                <Box display="flex" gap={2}>
                  <CalendarIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Ngày bắt đầu</Typography>
                    <Typography variant="subtitle1">{contract.start_date ? new Date(contract.start_date).toLocaleDateString('vi-VN') : '-'}</Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <CalendarIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Ngày kết thúc</Typography>
                    <Typography variant="subtitle1">{contract.end_date ? new Date(contract.end_date).toLocaleDateString('vi-VN') : '-'}</Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2} alignItems="center">
                  {contract.status === 'active' ? <CheckCircleIcon color="success" /> : <XCircleIcon color="error" />}
                  <Box>
                    <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                    {getStatusChip(contract.status)}
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <CalendarIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Ngày ký</Typography>
                    <Typography variant="subtitle1">{contract.created_at ? new Date(contract.created_at).toLocaleDateString('vi-VN') : '-'}</Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          {contract.notes && (
            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Ghi chú</Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{contract.notes}</Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Payment Tab */}
      {activeTab === 'payment' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Thông tin thanh toán</Typography>
            {getPaymentChip(contract.payment_status)}
          </Stack>

          <Box sx={{ mb: 2, p: 2, borderRadius: 1, background: 'linear-gradient(90deg,#f0f7ff,#eef2ff)' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">Phí bảo hiểm</Typography>
                <Typography variant="h6">{parseFloat(contract.premium_amount || 0).toLocaleString('vi-VN')} VNĐ</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                <Typography variant="h6">{contract.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">Hình thức</Typography>
                <Typography variant="h6">{contract.payment_method ? getPaymentMethodLabel(contract.payment_method) : '-'}</Typography>
              </Grid>
            </Grid>
          </Box>

          {contract.payment_status === 'paid' && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Chi tiết thanh toán</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">Ngày thanh toán</Typography>
                  <Typography>{contract.payment_date ? new Date(contract.payment_date).toLocaleDateString('vi-VN') : '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">Hình thức thanh toán</Typography>
                  <Typography>{contract.payment_method ? getPaymentMethodLabel(contract.payment_method) : '-'}</Typography>
                </Grid>
              </Grid>

              {contract.payment_notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">Ghi chú</Typography>
                  <Typography>{contract.payment_notes}</Typography>
                </Box>
              )}
            </Paper>
          )}

          <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
            {contract.payment_status !== 'paid' ? (
              <Button variant="contained" startIcon={<BanknotesIcon />} disabled={contract.status !== 'active'} onClick={() => setShowPaymentModal(true)}>Đánh dấu đã thanh toán</Button>
            ) : (
              <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrintReceipt}>In biên lai</Button>
            )}

            {contract.status !== 'active' && contract.payment_status !== 'paid' && (
              <Typography color="warning.main" sx={{ display: 'flex', alignItems: 'center' }}>⚠️ Chỉ có thể thanh toán khi hợp đồng đang có hiệu lực</Typography>
            )}
          </Stack>
        </Paper>
      )}

      {/* Parties Tab */}
      {activeTab === 'parties' && (
        <Box sx={{ mb: 3 }}>
          {customer && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <UserIcon color="primary" />
                  <Typography variant="h6">Khách hàng</Typography>
                </Stack>
                <Button variant="text" onClick={() => navigate(`/customers/${customer.customer_id}`)}>Xem chi tiết →</Button>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}><Typography variant="body2" color="text.secondary">Họ và tên</Typography><Typography>{customer.full_name}</Typography></Grid>
                <Grid item xs={12} md={6}><Typography variant="body2" color="text.secondary">CMND/CCCD</Typography><Typography>{customer.id_number}</Typography></Grid>
                <Grid item xs={12} md={6}><Typography variant="body2" color="text.secondary">Số điện thoại</Typography><Typography>{customer.phone}</Typography></Grid>
                <Grid item xs={12} md={6}><Typography variant="body2" color="text.secondary">Email</Typography><Typography>{customer.email || 'Chưa cập nhật'}</Typography></Grid>
                <Grid item xs={12}><Typography variant="body2" color="text.secondary">Địa chỉ</Typography><Typography>{customer.address}</Typography></Grid>
              </Grid>
            </Paper>
          )}

          {vehicle && (
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center"><TruckIcon color="primary" /><Typography variant="h6">Phương tiện</Typography></Stack>
                <Button variant="text" onClick={() => navigate(`/vehicles/${vehicle.vehicle_id}`)}>Xem chi tiết →</Button>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}><Typography variant="body2" color="text.secondary">Biển số xe</Typography><Typography variant="h6">{vehicle.license_plate}</Typography></Grid>
                <Grid item xs={12} md={6}><Typography variant="body2" color="text.secondary">Loại xe</Typography><Typography>{vehicle.vehicle_type}</Typography></Grid>
                <Grid item xs={12} md={6}><Typography variant="body2" color="text.secondary">Hãng xe</Typography><Typography>{vehicle.manufacturer}</Typography></Grid>
                <Grid item xs={12} md={6}><Typography variant="body2" color="text.secondary">Model</Typography><Typography>{vehicle.model}</Typography></Grid>
                <Grid item xs={12} md={6}><Typography variant="body2" color="text.secondary">Năm sản xuất</Typography><Typography>{vehicle.manufacturing_year}</Typography></Grid>
                <Grid item xs={12} md={6}><Typography variant="body2" color="text.secondary">Màu sắc</Typography><Typography>{vehicle.color || 'Chưa cập nhật'}</Typography></Grid>
              </Grid>
            </Paper>
          )}
        </Box>
      )}

      {/* Assessments Tab */}
      {activeTab === 'assessments' && (
        <Paper sx={{ p: 2 }}>
          {assessments.length === 0 ? (
            <Box textAlign="center" py={6}>
              <ClipboardDocumentListIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">Chưa có định giá nào cho hợp đồng này</Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(`/assessments/new?contract_id=${id}`)}>Tạo định giá</Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ngày định giá</TableCell>
                    <TableCell>Giá trị định giá</TableCell>
                    <TableCell>Người định giá</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assessments.map(a => (
                    <TableRow key={a.assessment_id} hover>
                      <TableCell>{a.assessment_date ? new Date(a.assessment_date).toLocaleDateString('vi-VN') : '-'}</TableCell>
                      <TableCell>{parseFloat(a.assessed_value).toLocaleString('vi-VN')} VNĐ</TableCell>
                      <TableCell>{a.assessor_name || 'N/A'}</TableCell>
                      <TableCell>{getAssessmentChip(a.status)}</TableCell>
                      <TableCell><Button variant="text" onClick={() => navigate(`/assessments/${a.assessment_id}`)}>Chi tiết</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} contract={contract} onConfirm={handleConfirmPayment} />
    </Container>
  );
};

export default ContractDetail;