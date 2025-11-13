import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Print as PrintIcon,
  Autorenew as AutorenewIcon,
  SwapHoriz as TransferIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import contractService from '../../services/contractService';
import { formatCurrency, formatDate } from '../../utils/formatters';

const ContractList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0); // 0: Quản lý, 1: Phát hành, 2: Tái tục
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    active: 0,
    pending: 0,
    expiring: 0
  });

  useEffect(() => {
    fetchContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      let params = {};
      
      if (activeTab === 1) {
        // Phát hành: hợp đồng mới tạo, chưa ký
        params.trangThai = 'Chờ ký';
      } else if (activeTab === 2) {
        // Tái tục: hợp đồng đang hiệu lực hoặc hết hạn
        params.trangThai = 'Hiệu lực,Hết hạn';
      }

      const response = await contractService.getAll(params);
      const data = response.data || response.list || [];
      setContracts(data);

      // Calculate stats
      setStats({
        active: data.filter(c => c.TrangThai === 'Hiệu lực').length,
        pending: data.filter(c => c.TrangThai === 'Chờ ký' || c.TrangThai === 'Chờ duyệt').length,
        expiring: data.filter(c => {
          if (!c.NgayHetHan) return false;
          const daysLeft = Math.floor((new Date(c.NgayHetHan) - new Date()) / (1000 * 60 * 60 * 24));
          return daysLeft >= 0 && daysLeft <= 15;
        }).length
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Xác nhận xóa hợp đồng ${row.MaHD}?`)) return;
    try {
      await contractService.delete(row.MaHD);
      alert('✅ Đã xóa hợp đồng');
      fetchContracts();
    } catch (error) {
      alert('Lỗi: ' + (error.message || error));
    }
  };

  const handleRenew = async (row) => {
    if (!window.confirm(`Xác nhận tái tục hợp đồng ${row.MaHD}?`)) return;
    try {
      const result = await contractService.renew(row.MaHD);
      alert(`✅ Đã tạo hợp đồng tái tục: ${result.data.MaHD}`);
      fetchContracts();
    } catch (error) {
      alert('Lỗi: ' + (error.message || error));
    }
  };

  const handleCancel = async (row) => {
    const lyDo = window.prompt('Nhập lý do hủy hợp đồng:');
    if (!lyDo) return;
    
    try {
      await contractService.cancel(row.MaHD, lyDo);
      alert('✅ Đã hủy hợp đồng và tính hoàn phí');
      fetchContracts();
    } catch (error) {
      alert('Lỗi: ' + (error.message || error));
    }
  };

  const handlePrintContract = async (row) => {
    try {
      await contractService.downloadContract(row.MaHD);
    } catch (error) {
      alert('Lỗi: ' + (error.message || error));
    }
  };

  const handlePrintCertificate = async (row) => {
    try {
      await contractService.downloadCertificate(row.MaHD);
    } catch (error) {
      alert('Lỗi: ' + (error.message || error));
    }
  };

  const getStatusChip = (status) => {
    const map = {
      'Hiệu lực': { color: 'success', label: 'Hiệu lực' },
      'Hết hạn': { color: 'default', label: 'Hết hạn' },
      'Chờ ký': { color: 'warning', label: 'Chờ ký' },
      'Chờ duyệt': { color: 'info', label: 'Chờ duyệt' },
      'Đã hủy': { color: 'error', label: 'Đã hủy' }
    };
    const cfg = map[status] || { color: 'default', label: status };
    return <Chip label={cfg.label} color={cfg.color} size="small" />;
  };

  // Columns for Tab 1: Quản lý hợp đồng
  const manageColumns = [
    { field: 'MaHD', headerName: 'Mã HĐ', width: 120 },
    { field: 'TenKhachHang', headerName: 'Khách hàng', width: 180 },
    { field: 'BienSo', headerName: 'Biển số', width: 120 },
    { field: 'TenGoiBaoHiem', headerName: 'Gói BH', width: 150 },
    { field: 'PhiBaoHiem', headerName: 'Phí BH', width: 130, renderCell: (row) => formatCurrency(row.PhiBaoHiem) },
    { field: 'TrangThai', headerName: 'Trạng thái', width: 130, renderCell: (row) => getStatusChip(row.TrangThai) },
    { field: 'NgayKy', headerName: 'Ngày ký', width: 120, renderCell: (row) => formatDate(row.NgayKy) },
    { field: 'NgayHetHan', headerName: 'Ngày hết hạn', width: 130, renderCell: (row) => formatDate(row.NgayHetHan) },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 150,
      renderCell: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Xem chi tiết">
            <IconButton size="small" color="primary" onClick={() => navigate(`/contracts/${row.MaHD}`)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton size="small" color="warning" onClick={(e) => { e.stopPropagation(); navigate(`/contracts/edit/${row.MaHD}`); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(row); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  // Columns for Tab 2: Phát hành
  const publishColumns = [
    { field: 'MaHD', headerName: 'Mã HĐ', width: 120 },
    { field: 'TenKhachHang', headerName: 'Khách hàng', width: 180 },
    { field: 'BienSo', headerName: 'Biển số', width: 120 },
    { field: 'PhiBaoHiem', headerName: 'Phí BH', width: 130, renderCell: (row) => formatCurrency(row.PhiBaoHiem) },
    { field: 'NgayTao', headerName: 'Ngày tạo', width: 120, renderCell: (row) => formatDate(row.NgayTao) },
    { field: 'TrangThai', headerName: 'Trạng thái', width: 130, renderCell: (row) => getStatusChip(row.TrangThai) },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 200,
      renderCell: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Xem chi tiết">
            <IconButton size="small" color="primary" onClick={() => navigate(`/contracts/${row.MaHD}`)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="In hợp đồng">
            <IconButton size="small" color="secondary" onClick={(e) => { e.stopPropagation(); handlePrintContract(row); }}>
              <PrintIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="In chứng nhận">
            <IconButton size="small" color="info" onClick={(e) => { e.stopPropagation(); handlePrintCertificate(row); }}>
              <DescriptionIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  // Columns for Tab 3: Tái tục
  const renewalColumns = [
    { field: 'MaHD', headerName: 'Mã HĐ', width: 120 },
    { field: 'TenKhachHang', headerName: 'Khách hàng', width: 180 },
    { field: 'BienSo', headerName: 'Biển số', width: 120 },
    { field: 'TrangThai', headerName: 'Trạng thái', width: 120, renderCell: (row) => getStatusChip(row.TrangThai) },
    { field: 'NgayHetHan', headerName: 'Ngày hết hạn', width: 130, renderCell: (row) => formatDate(row.NgayHetHan) },
    {
      field: 'daysLeft',
      headerName: 'Còn lại',
      width: 100,
      renderCell: (row) => {
        if (!row.NgayHetHan) return '-';
        const days = Math.floor((new Date(row.NgayHetHan) - new Date()) / (1000 * 60 * 60 * 24));
        return days >= 0 ? `${days} ngày` : 'Đã hết hạn';
      }
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 220,
      renderCell: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Xem chi tiết">
            <IconButton size="small" color="primary" onClick={() => navigate(`/contracts/${row.MaHD}`)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Tái tục">
            <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handleRenew(row); }}>
              <AutorenewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chuyển nhượng">
            <IconButton size="small" color="info" onClick={(e) => { e.stopPropagation(); navigate(`/contracts/${row.MaHD}/transfer`); }}>
              <TransferIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hủy (hoàn phí)">
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleCancel(row); }}>
              <CancelIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  const getCurrentColumns = () => {
    switch (activeTab) {
      case 1: return publishColumns;
      case 2: return renewalColumns;
      default: return manageColumns;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Quản lý hợp đồng
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quản lý, phát hành và tái tục hợp đồng bảo hiểm
            </Typography>
          </Box>
          {activeTab === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/contracts/new')}
            >
              Tạo hợp đồng
            </Button>
          )}
        </Stack>
      </Box>

      {/* Stats Cards - chỉ hiện ở tab Quản lý */}
      {activeTab === 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Đang hiệu lực</Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">{stats.active}</Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.light', opacity: 0.3 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Cần duyệt</Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">{stats.pending}</Typography>
                  </Box>
                  <DescriptionIcon sx={{ fontSize: 48, color: 'warning.light', opacity: 0.3 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Sắp hết hạn (15 ngày)</Typography>
                    <Typography variant="h4" fontWeight="bold" color="error.main">{stats.expiring}</Typography>
                  </Box>
                  <AutorenewIcon sx={{ fontSize: 48, color: 'error.light', opacity: 0.3 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} textColor="primary" indicatorColor="primary">
          <Tab label="Quản lý hợp đồng" />
          <Tab label="Quản lý phát hành" />
          <Tab label="Quản lý tái tục" />
        </Tabs>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table
          columns={getCurrentColumns()}
          data={contracts}
          loading={loading}
          emptyMessage="Chưa có hợp đồng nào"
          pageSize={10}
          getRowId={(row) => row.MaHD}
        />
      </Paper>
    </Container>
  );
};

export default ContractList;
