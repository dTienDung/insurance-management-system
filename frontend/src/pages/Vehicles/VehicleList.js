import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import vehicleService from '../../services/vehicleService';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';

const VehicleList = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getAll();

      // Normalize different possible response shapes from backend / services.
      // Accepts: Array, { data: Array }, { vehicles: Array }, { items: Array }
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      } else if (data && Array.isArray(data.vehicles)) {
        list = data.vehicles;
      } else if (data && Array.isArray(data.items)) {
        list = data.items;
      } else {
        // unexpected shape: keep state as empty array and log for debugging
        console.warn('Unexpected vehicles response shape, expected array-like but got:', data);
      }

      setVehicles(list);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (maXe) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phương tiện này?')) return;

    try {
      await vehicleService.delete(maXe);
      alert('Xóa phương tiện thành công!');
      fetchVehicles();
    } catch (error) {
      alert('Không thể xóa phương tiện');
    }
  };

  const filteredVehicles = vehicles.filter(v =>
    v.HangXe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.LoaiXe?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalVehicles = vehicles.length;
  const goodCondition = vehicles.filter(v => v.TinhTrangKT === 'Tốt').length;
  const needMaintenance = vehicles.filter(v => 
    v.TinhTrangKT !== 'Tốt' && v.TinhTrangKT !== 'Yếu'
  ).length;
  const totalValue = vehicles.reduce((sum, v) => sum + (v.GiaTriXe || 0), 0);

  const columns = [
    {
      field: 'MaXe',
      headerName: 'Mã xe',
      width: 100,
      renderCell: (row) => (
        <Chip label={row.MaXe} color="primary" size="small" variant="outlined" />
      )
    },
    { field: 'HangXe', headerName: 'Hãng xe', width: 150, key: 'HangXe' },
    { field: 'LoaiXe', headerName: 'Loại xe', width: 150, key: 'LoaiXe' },
    { field: 'NamSX', headerName: 'Năm SX', width: 100, key: 'NamSX' },
    {
      field: 'GiaTriXe',
      headerName: 'Giá trị',
      width: 150,
      renderCell: (row) => (
        <Typography variant="body2">
          {new Intl.NumberFormat('vi-VN').format(row.GiaTriXe)} đ
        </Typography>
      )
    },
    {
      field: 'TinhTrangKT',
      headerName: 'Tình trạng',
      width: 120,
      renderCell: (row) => {
        const colorMap = {
          'Tốt': 'success',
          'Trung bình': 'warning',
          'Yếu': 'error'
        };
        return (
          <Chip 
            label={row.TinhTrangKT} 
            color={colorMap[row.TinhTrangKT] || 'default'}
            size="small"
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 150,
      sortable: false,
      renderCell: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Xem chi tiết">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/vehicles/${row.MaXe}`);
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton
              size="small"
              color="warning"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/vehicles/edit/${row.MaXe}`);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row.MaXe);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Quản lý Phương tiện
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Danh sách tất cả phương tiện trong hệ thống
            </Typography>
          </Box>
          <Button
            variant="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/vehicles/new')}
          >
            Thêm phương tiện
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Tổng phương tiện
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
                    {totalVehicles}
                  </Typography>
                </Box>
                <Box sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  p: 2, 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CarIcon sx={{ fontSize: 40 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Tình trạng tốt
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
                    {goodCondition}
                  </Typography>
                </Box>
                <Box sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  p: 2, 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BuildIcon sx={{ fontSize: 40 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Cần bảo dưỡng
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
                    {needMaintenance}
                  </Typography>
                </Box>
                <Box sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  p: 2, 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <WarningIcon sx={{ fontSize: 40 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Tổng giá trị
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                    {new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(totalValue)} đ
                  </Typography>
                </Box>
                <Box sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  p: 2, 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MoneyIcon sx={{ fontSize: 40 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SearchBar */}
      <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2, mb: 3 }}>
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Tìm kiếm theo biển số, hãng xe, loại xe..."
          actions={[
            {
              label: 'Làm mới',
              variant: 'outlined',
              onClick: fetchVehicles,
              icon: <RefreshIcon />
            }
          ]}
        />
      </Box>

      {/* Table */}
      <Box sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={filteredVehicles}
          loading={loading}
          onRowClick={(row) => navigate(`/vehicles/${row.MaXe}`)}
          emptyMessage="Chưa có phương tiện nào"
          pageSize={10}
          getRowId={(row) => row.MaXe}
        />
      </Box>
    </Container>
  );
};

export default VehicleList;