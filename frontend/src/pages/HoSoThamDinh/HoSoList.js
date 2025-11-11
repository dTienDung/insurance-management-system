import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Chip
} from '@mui/material';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import hosoService from '../../services/hosoService';

const HoSoList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // placeholder for future status filter
  const [page] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  useEffect(() => {
    fetchHoso();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  async function fetchHoso() {
    try {
      setLoading(true);
      const { list, pagination: pg } = await hosoService.getAll({ status: filter, page });
      setData(list);
      setPagination(pg);
    } catch (error) {
      console.error('[HoSoList] Fetch error:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  function getStatusChip(status) {
    const statusMap = {
      'Chờ thẩm định': { color: 'warning', label: 'Chờ thẩm định' },
      'Đã thẩm định': { color: 'success', label: 'Đã thẩm định' },
      'Từ chối': { color: 'error', label: 'Từ chối' }
    };
    const cfg = statusMap[status] || { color: 'default', label: status };
    return <Chip label={cfg.label} color={cfg.color} size="small" />;
  }

  const columns = [
    { field: 'MaHS', headerName: 'Mã HS', width: 110 },
    { field: 'TenKhach', headerName: 'Khách hàng', width: 180, renderCell: row => row.TenKhach || row.MaKH },
    { field: 'BienSo', headerName: 'Biển số', width: 130, renderCell: row => row.BienSo || row.MaXe },
    { field: 'TrangThai', headerName: 'Trạng thái', width: 150, renderCell: row => getStatusChip(row.TrangThai) },
    { field: 'NgayLap', headerName: 'Ngày lập', width: 140, renderCell: row => row.NgayLap ? new Date(row.NgayLap).toLocaleDateString() : '' }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Hồ sơ thẩm định
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Danh sách các hồ sơ thẩm định
            </Typography>
          </Box>
          <Button variant="primary" onClick={() => navigate('/hoso/tao')}>
            Tạo hồ sơ
          </Button>
        </Stack>
      </Box>

      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(e, val) => val && setFilter(val)}
          size="small"
        >
          <ToggleButton value="all">Tất cả</ToggleButton>
          <ToggleButton value="pending">Chờ thẩm định</ToggleButton>
          <ToggleButton value="approved">Đã thẩm định</ToggleButton>
          <ToggleButton value="rejected">Từ chối</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={data}
          loading={loading}
          emptyMessage="Chưa có hồ sơ nào"
          pageSize={pagination.limit || 10}
          onRowClick={(row) => navigate(`/hoso/${row.MaHS}`)}
          getRowId={(row) => row.MaHS}
        />
      </Box>
    </Container>
  );
};

export default HoSoList;
