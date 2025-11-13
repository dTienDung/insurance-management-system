import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import customerService from '../../services/customerService';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import { formatDate, formatPhone } from '../../utils/formatters';

const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getAll();
      setCustomers(response.data || response.list || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Xác nhận xóa khách hàng ${row.HoTen}?`)) return;
    try {
      await customerService.delete(row.MaKH);
      alert('✅ Đã xóa khách hàng');
      fetchCustomers();
    } catch (error) {
      alert('Lỗi: ' + (error.message || error));
    }
  };

  const columns = [
    { field: 'MaKH', headerName: 'Mã KH', width: 110 },
    { field: 'HoTen', headerName: 'Họ và tên', width: 200 },
    { field: 'CMND_CCCD', headerName: 'CMND/CCCD', width: 140 },
    { field: 'NgaySinh', headerName: 'Ngày sinh', width: 120, renderCell: (row) => formatDate(row.NgaySinh) },
    { field: 'SDT', headerName: 'Số điện thoại', width: 130, renderCell: (row) => formatPhone(row.SDT) },
    { field: 'Email', headerName: 'Email', width: 220 },
    { field: 'DiaChi', headerName: 'Địa chỉ', width: 200 },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 150,
      renderCell: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Xem chi tiết">
            <IconButton 
              size="small" 
              color="primary" 
              onClick={() => row.MaKH && navigate(`/customers/${row.MaKH}`)}
              disabled={!row.MaKH}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton 
              size="small" 
              color="warning" 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (row.MaKH) navigate(`/customers/edit/${row.MaKH}`); 
              }}
              disabled={!row.MaKH}
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
                if (row.MaKH) handleDelete(row); 
              }}
              disabled={!row.MaKH}
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
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Quản lý khách hàng
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Danh sách tất cả khách hàng trong hệ thống
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/customers/new')}
          >
            Thêm khách hàng
          </Button>
        </Stack>
      </Box>

      {/* Bảng danh sách */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={customers}
          loading={loading}
          emptyMessage="Chưa có khách hàng nào"
          pageSize={10}
          getRowId={(row) => row.MaKH}
        />
      </Paper>
    </Container>
  );
};

export default CustomerList;
