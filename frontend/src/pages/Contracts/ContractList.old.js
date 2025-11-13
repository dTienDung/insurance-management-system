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
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  Add as AddIcon,
  FileDownload as ExportIcon,
  Autorenew as RenewIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import contractService from '../../services/contractService';
import exportService from '../../services/exportService';

const ContractList = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, expired, pending

  useEffect(() => {
    fetchContracts();
  }, [filter]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await contractService.getAll({ 
        status: filter !== 'all' ? filter : undefined 
      });
      setContracts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (maHD) => {
    try {
      await exportService.exportHopDong(maHD);
      alert('Xuất hợp đồng thành công!');
    } catch (error) {
      alert('Không thể xuất hợp đồng');
    }
  };

  const handleRenew = async (maHD) => {
    if (!window.confirm('Bạn có muốn tái tục hợp đồng này?')) return;
    
    try {
      await contractService.renew(maHD, {});
      alert('Tái tục hợp đồng thành công!');
      fetchContracts();
    } catch (error) {
      alert('Không thể tái tục hợp đồng');
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      'Hiệu lực': { color: 'success', label: 'Hiệu lực' },
      'Hết hạn': { color: 'default', label: 'Hết hạn' },
      'Chờ duyệt': { color: 'warning', label: 'Chờ duyệt' },
      'Đã hủy': { color: 'error', label: 'Đã hủy' }
    };
    const config = statusMap[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const columns = [
    { 
      field: 'MaHD', 
      headerName: 'Mã HĐ', 
      width: 120,
      key: 'MaHD'
    },
    { 
      field: 'KhachHang', 
      headerName: 'Khách hàng', 
      width: 200,
      key: 'KhachHang'
    },
    { 
      field: 'MaXe', 
      headerName: 'Mã xe', 
      width: 100,
      key: 'MaXe'
    },
    { 
      field: 'PhiBaoHiem', 
      headerName: 'Phí BH',
      width: 150,
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={500}>
          {new Intl.NumberFormat('vi-VN').format(row.PhiBaoHiem)} đ
        </Typography>
      )
    },
    {
      field: 'NgayKy',
      headerName: 'Ngày ký',
      width: 120,
      renderCell: (row) => format(new Date(row.NgayKy), 'dd/MM/yyyy')
    },
    {
      field: 'NgayHetHan',
      headerName: 'Hết hạn',
      width: 120,
      renderCell: (row) => format(new Date(row.NgayHetHan), 'dd/MM/yyyy')
    },
    {
      field: 'TrangThai',
      headerName: 'Trạng thái',
      width: 130,
      renderCell: (row) => getStatusChip(row.TrangThai)
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 150,
      sortable: false,
      renderCell: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Xuất HĐ">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleExport(row.MaHD);
              }}
            >
              <ExportIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.TrangThai === 'Hết hạn' && (
            <Tooltip title="Tái tục">
              <IconButton
                size="small"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRenew(row.MaHD);
                }}
              >
                <RenewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
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
              Quản lý Hợp đồng
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Danh sách hợp đồng bảo hiểm
            </Typography>
          </Box>
          <Button
            variant="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/contracts/new')}
          >
            Tạo hợp đồng
          </Button>
        </Stack>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(e, newFilter) => newFilter && setFilter(newFilter)}
          size="small"
        >
          <ToggleButton value="all">
            Tất cả
          </ToggleButton>
          <ToggleButton value="active">
            Hiệu lực
          </ToggleButton>
          <ToggleButton value="expired">
            Hết hạn
          </ToggleButton>
          <ToggleButton value="pending">
            Chờ duyệt
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Table */}
      <Box sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={contracts}
          loading={loading}
          onRowClick={(row) => navigate(`/contracts/${row.MaHD}`)}
          emptyMessage="Chưa có hợp đồng nào"
          pageSize={10}
          getRowId={(row) => row.MaHD}
        />
      </Box>
    </Container>
  );
};

export default ContractList;