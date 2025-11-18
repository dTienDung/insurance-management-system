import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
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
import SearchBar from '../../components/common/SearchBar';
import CustomerModal from './CustomerModal';
import CustomerDetailModal from './CustomerDetailModal';
import { formatDate, formatPhone } from '../../utils/formatters';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailCustomerId, setDetailCustomerId] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { 
        page: pagination.page, 
        limit: pagination.limit
      };
      if (searchTerm) params.search = searchTerm;
      
      const response = await customerService.getAll(params);
      setCustomers(response.data || response.list || []);
      if (response.pagination) {
        setPagination(prev => ({ ...prev, total: response.pagination.total }));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage + 1 })); // MUI uses 0-based index
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination(prev => ({ ...prev, limit: newPageSize, page: 1 }));
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset về trang 1 khi search
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

  const handleAdd = () => {
    setSelectedCustomerId(null);
    setModalOpen(true);
  };

  const handleEdit = (customerId) => {
    setSelectedCustomerId(customerId);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCustomerId(null);
  };

  const handleModalSuccess = () => {
    fetchCustomers();
  };

  const handleViewDetail = (customerId) => {
    setDetailCustomerId(customerId);
    setDetailModalOpen(true);
  };

  const columns = [
    { field: 'MaKH', headerName: 'Mã KH', width: 110 },
    { field: 'HoTen', headerName: 'Họ và tên', width: 200 },
    { field: 'CMND_CCCD', headerName: 'CMND/CCCD', width: 140 },
    { field: 'NgaySinh', headerName: 'Ngày sinh', width: 120, renderCell: (params) => formatDate(params.row.NgaySinh) },
    { field: 'SDT', headerName: 'Số điện thoại', width: 130, renderCell: (params) => formatPhone(params.row.SDT) },
    { field: 'Email', headerName: 'Email', width: 220 },
    { field: 'DiaChi', headerName: 'Địa chỉ', width: 200 },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Xem chi tiết">
            <IconButton 
              size="small" 
              color="primary" 
              onClick={(e) => { 
                e.stopPropagation(); 
                handleViewDetail(params.row.MaKH);
              }}
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
                handleEdit(params.row.MaKH); 
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
                handleDelete(params.row); 
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
            onClick={handleAdd}
          >
            Thêm khách hàng
          </Button>
        </Stack>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 2 }}>
        <SearchBar
          placeholder="Tìm kiếm theo tên, CCCD, SĐT..."
          onSearch={handleSearch}
        />
      </Box>

      {/* Bảng danh sách */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={customers}
          loading={loading}
          emptyMessage="Chưa có khách hàng nào"
          pageSize={pagination.limit}
          rowCount={pagination.total}
          page={pagination.page - 1}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          paginationMode="server"
          getRowId={(row) => row.MaKH}
        />
      </Paper>

      {/* Modal thêm/sửa */}
      <CustomerModal
        open={modalOpen}
        onClose={handleModalClose}
        customerId={selectedCustomerId}
        onSuccess={handleModalSuccess}
      />

      {/* Modal xem chi tiết */}
      <CustomerDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        customerId={detailCustomerId}
      />
    </Container>
  );
};

export default CustomerList;
