// ============================================
// VÍ DỤ SỬ DỤNG TableWithSearch
// ============================================

import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Chip } from '@mui/material';
import TableWithSearch from '../../components/common/TableWithSearch';
import { customerAPI } from '../../services/api';

const CustomerListExample = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getAll();
      setData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Định nghĩa columns
  const columns = [
    {
      field: 'MaKH',
      headerName: 'Mã KH',
      width: 100,
      searchable: true, // Cho phép search
    },
    {
      field: 'HoTen',
      headerName: 'Họ tên',
      width: 200,
      searchable: true,
    },
    {
      field: 'CCCD',
      headerName: 'CCCD',
      width: 150,
      searchable: true,
    },
    {
      field: 'SDT',
      headerName: 'Số điện thoại',
      width: 130,
      searchable: true,
    },
    {
      field: 'Email',
      headerName: 'Email',
      width: 200,
      searchable: true,
    },
    {
      field: 'DiaChi',
      headerName: 'Địa chỉ',
      width: 250,
      searchable: true,
    },
    {
      field: 'TongHopDong',
      headerName: 'Số HĐ',
      width: 80,
      searchable: false, // Không cho search cột này
      renderCell: (row) => (
        <Chip 
          label={row.TongHopDong || 0} 
          size="small" 
          color={row.TongHopDong > 0 ? 'primary' : 'default'}
        />
      ),
    },
  ];

  const handleRowClick = (row) => {
    console.log('Clicked:', row);
    // Navigate to detail page
    // navigate(`/customers/${row.MaKH}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Danh sách khách hàng
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tìm kiếm trực tiếp trên từng cột
        </Typography>
      </Box>

      <TableWithSearch
        columns={columns}
        data={data}
        loading={loading}
        onRowClick={handleRowClick}
        emptyMessage="Chưa có khách hàng nào"
        pageSize={10}
        getRowId={(row) => row.MaKH}
      />
    </Container>
  );
};

export default CustomerListExample;
