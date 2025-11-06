import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import customerService from '../../services/customerService';

// Import converted MUI components
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';

const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getAll();
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      try {
        await customerService.delete(id);
        fetchCustomers();
      } catch (error) {
        alert('Lỗi: ' + error.message);
      }
    }
  };

  // Calculate stats
  const totalCustomers = customers.length;
  const newCustomersThisMonth = customers.filter(c => {
    if (!c.NgayTao) return false;
    const createdDate = new Date(c.NgayTao);
    const now = new Date();
    return createdDate.getMonth() === now.getMonth() && 
           createdDate.getFullYear() === now.getFullYear();
  }).length;
  const activeContracts = customers.filter(c => c.TongHopDong > 0).length;

  // Table columns
  const columns = [
    {
      field: 'MaKH',
      headerName: 'Mã KH',
      width: 120,
      renderCell: (row) => (
        <Chip 
          label={row.MaKH} 
          color="primary" 
          size="small" 
          variant="outlined"
        />
      )
    },
    {
      field: 'HoTen',
      headerName: 'Họ và tên',
      width: 200,
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={500}>
          {row.HoTen}
        </Typography>
      )
    },
    {
      field: 'CMND_CCCD',
      headerName: 'CMND/CCCD',
      width: 150,
      key: 'CMND_CCCD'
    },
    {
      field: 'NgaySinh',
      headerName: 'Ngày sinh',
      width: 120,
      renderCell: (row) => {
        return row.NgaySinh ? format(new Date(row.NgaySinh), 'dd/MM/yyyy') : '-';
      }
    },
    {
      field: 'SDT',
      headerName: 'Số điện thoại',
      width: 130,
      key: 'SDT'
    },
    {
      field: 'Email',
      headerName: 'Email',
      width: 200,
      flex: 1,
      key: 'Email'
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
                navigate(`/customers/${row.MaKH}`);
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
                navigate(`/customers/edit/${row.MaKH}`);
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
                handleDelete(row.MaKH);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  // Filter customers
  const filteredCustomers = searchTerm
    ? customers.filter(c =>
        c.HoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.CMND_CCCD?.includes(searchTerm) ||
        c.SDT?.includes(searchTerm) ||
        c.Email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : customers;

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Quản lý Khách hàng
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Danh sách tất cả khách hàng trong hệ thống
              </Typography>
            </Box>
            <Button
              variant="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/customers/new')}
            >
              Thêm khách hàng
            </Button>
          </Stack>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              height: '100%'
            }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Tổng khách hàng
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
                      {totalCustomers}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5 }}>
                      Tất cả khách hàng
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
                    <PeopleIcon sx={{ fontSize: 40 }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              height: '100%'
            }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Khách hàng mới
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
                      {newCustomersThisMonth}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5 }}>
                      Trong tháng này
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
                    <PersonAddIcon sx={{ fontSize: 40 }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              height: '100%'
            }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Hợp đồng hiệu lực
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
                      {activeContracts}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5 }}>
                      Đang hoạt động
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
                    <DescriptionIcon sx={{ fontSize: 40 }} />
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
            placeholder="Tìm kiếm theo tên, CMND, số điện thoại, email..."
            actions={[
              {
                label: 'Làm mới',
                variant: 'outlined',
                onClick: fetchCustomers,
                icon: <RefreshIcon />
              }
            ]}
          />
        </Box>

        {/* Table */}
        <Box sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden' }}>
          <Table
            columns={columns}
            data={filteredCustomers}
            loading={loading}
            onRowClick={(row) => navigate(`/customers/${row.MaKH}`)}
            emptyMessage="Chưa có khách hàng nào trong hệ thống"
            pageSize={10}
            getRowId={(row) => row.MaKH}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default CustomerList;