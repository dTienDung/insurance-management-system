import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Drawer,
  Divider,
  TextField
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Description,
  CheckCircle,
  Warning,
  Visibility,
  Close,
  FileDownload
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { DataGrid } from '@mui/x-data-grid';
import reportService from '../../../services/reportService';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const OperationalDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    timeType: 'month',
    month: new Date().getMonth() + 1,
    quarter: Math.floor(new Date().getMonth() / 3) + 1,
    year: new Date().getFullYear(),
    status: 'all',
    package: 'all'
  });

  const [kpis, setKpis] = useState({
    totalContracts: 0,
    newContracts: 0,
    activeContracts: 0,
    expiringContracts: 0,
    renewalRate: 0
  });

  const [contractList, setContractList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [renewalData, setRenewalData] = useState([]);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with real API calls
      setKpis({
        totalContracts: 1250,
        newContracts: 85,
        activeContracts: 980,
        expiringContracts: 42,
        renewalRate: 78.5
      });

      // Revenue data by month
      setRevenueData([
        { month: 'T1', total: 850, coban: 320, nangcao: 380, toandien: 150 },
        { month: 'T2', total: 920, coban: 340, nangcao: 410, toandien: 170 },
        { month: 'T3', total: 1050, coban: 390, nangcao: 450, toandien: 210 },
        { month: 'T4', total: 980, coban: 360, nangcao: 420, toandien: 200 },
        { month: 'T5', total: 1120, coban: 410, nangcao: 480, toandien: 230 },
        { month: 'T6', total: 1200, coban: 450, nangcao: 520, toandien: 230 }
      ]);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    loadDashboardData();
  };

  const handleResetFilters = () => {
    setFilters({
      timeType: 'month',
      month: new Date().getMonth() + 1,
      quarter: Math.floor(new Date().getMonth() / 3) + 1,
      year: new Date().getFullYear(),
      status: 'all',
      package: 'all'
    });
  };

  const handleViewCustomerDetail = (customer) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
  };

  const KPICard = ({ title, value, icon: Icon, color, growth, suffix = '' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value.toLocaleString('vi-VN')}{suffix}
            </Typography>
            {growth !== undefined && (
              <Stack direction="row" spacing={0.5} alignItems="center" mt={1}>
                {growth >= 0 ? (
                  <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main', fontSize: 20 }} />
                )}
                <Typography
                  variant="body2"
                  color={growth >= 0 ? 'success.main' : 'error.main'}
                  fontWeight="medium"
                >
                  {Math.abs(growth)}%
                </Typography>
              </Stack>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${color}.lighter`,
              borderRadius: 2,
              p: 1.5,
              display: 'flex'
            }}
          >
            <Icon sx={{ fontSize: 32, color: color }} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  const contractColumns = [
    { field: 'MaHD', headerName: 'Số HĐ', width: 120 },
    { field: 'TenKH', headerName: 'Khách hàng', width: 180 },
    { field: 'BienSo', headerName: 'Biển số', width: 120 },
    { 
      field: 'GoiBaoHiem', 
      headerName: 'Gói bảo hiểm', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small"
          color={
            params.value === 'Cơ Bản' ? 'default' :
            params.value === 'Nâng Cao' ? 'primary' : 'success'
          }
        />
      )
    },
    { field: 'NgayHieuLuc', headerName: 'Ngày hiệu lực', width: 120 },
    { field: 'NgayHetHan', headerName: 'Ngày hết hạn', width: 120 },
    { 
      field: 'TrangThai', 
      headerName: 'Trạng thái', 
      width: 140,
      renderCell: (params) => {
        const statusMap = {
          'Mới': { color: 'info', label: 'Mới phát hành' },
          'Active': { color: 'success', label: 'Đang hiệu lực' },
          'Expiring': { color: 'warning', label: 'Sắp hết hạn' },
          'Expired': { color: 'default', label: 'Đã hết hạn' }
        };
        const config = statusMap[params.value] || { color: 'default', label: params.value };
        return <Chip label={config.label} color={config.color} size="small" />;
      }
    },
    { 
      field: 'PhiBaoHiem', 
      headerName: 'Phí BH', 
      width: 130,
      renderCell: (params) => formatCurrency(params.value)
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 120,
      renderCell: (params) => (
        <Button size="small" startIcon={<Visibility />}>
          Chi tiết
        </Button>
      )
    }
  ];

  return (
    <Box>
      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Loại thời gian</InputLabel>
              <Select
                value={filters.timeType}
                label="Loại thời gian"
                onChange={(e) => handleFilterChange('timeType', e.target.value)}
              >
                <MenuItem value="month">Tháng</MenuItem>
                <MenuItem value="quarter">Quý</MenuItem>
                <MenuItem value="year">Năm</MenuItem>
                <MenuItem value="custom">Tùy chọn</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {filters.timeType === 'month' && (
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Tháng</InputLabel>
                <Select
                  value={filters.month}
                  label="Tháng"
                  onChange={(e) => handleFilterChange('month', e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>Tháng {i + 1}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {filters.timeType === 'quarter' && (
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Quý</InputLabel>
                <Select
                  value={filters.quarter}
                  label="Quý"
                  onChange={(e) => handleFilterChange('quarter', e.target.value)}
                >
                  <MenuItem value={1}>Quý 1</MenuItem>
                  <MenuItem value={2}>Quý 2</MenuItem>
                  <MenuItem value={3}>Quý 3</MenuItem>
                  <MenuItem value={4}>Quý 4</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Năm</InputLabel>
              <Select
                value={filters.year}
                label="Năm"
                onChange={(e) => handleFilterChange('year', e.target.value)}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <MenuItem key={year} value={year}>{year}</MenuItem>;
                })}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filters.status}
                label="Trạng thái"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="new">Mới phát hành</MenuItem>
                <MenuItem value="active">Đang hiệu lực</MenuItem>
                <MenuItem value="expiring">Sắp hết hạn</MenuItem>
                <MenuItem value="expired">Đã hết hạn</MenuItem>
                <MenuItem value="renewed">Đã tái tục</MenuItem>
                <MenuItem value="cancelled">Đã hủy</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Gói bảo hiểm</InputLabel>
              <Select
                value={filters.package}
                label="Gói bảo hiểm"
                onChange={(e) => handleFilterChange('package', e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="coban">Cơ Bản</MenuItem>
                <MenuItem value="nangcao">Nâng Cao</MenuItem>
                <MenuItem value="toandien">Toàn Diện</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={handleApplyFilters} fullWidth>
                Áp dụng
              </Button>
              <Button variant="outlined" onClick={handleResetFilters} fullWidth>
                Reset
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard
            title="Tổng hợp đồng"
            value={kpis.totalContracts}
            icon={Description}
            color="primary.main"
            growth={5.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard
            title="HĐ mới phát hành"
            value={kpis.newContracts}
            icon={Description}
            color="info.main"
            growth={8.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard
            title="HĐ đang hiệu lực"
            value={kpis.activeContracts}
            icon={CheckCircle}
            color="success.main"
            growth={3.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard
            title="Sắp hết hạn (T-15)"
            value={kpis.expiringContracts}
            icon={Warning}
            color="warning.main"
            growth={-2.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard
            title="Tỷ lệ tái tục"
            value={kpis.renewalRate}
            icon={TrendingUp}
            color="success.main"
            suffix="%"
            growth={4.3}
          />
        </Grid>
      </Grid>

      {/* Revenue Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Doanh thu theo thời gian (triệu VNĐ)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => value.toLocaleString('vi-VN') + 'M'} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#1976d2" name="Tổng doanh thu" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Doanh thu theo gói BH
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="coban" fill="#8884d8" name="Cơ Bản" />
                <Bar dataKey="nangcao" fill="#82ca9d" name="Nâng Cao" />
                <Bar dataKey="toandien" fill="#ffc658" name="Toàn Diện" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Contract List */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            Danh sách hợp đồng theo trạng thái
          </Typography>
          <Button startIcon={<FileDownload />} variant="outlined">
            Xuất Excel
          </Button>
        </Stack>
        <Box sx={{ height: 400 }}>
          <DataGrid
            rows={contractList}
            columns={contractColumns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            getRowId={(row) => row.MaHD}
          />
        </Box>
      </Paper>

      {/* Customer Detail Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 600 } }}
      >
        <Box sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              Chi tiết khách hàng
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Stack>

          {selectedCustomer && (
            <>
              <Divider sx={{ mb: 2 }} />
              {/* Customer info, vehicles, contracts will be displayed here */}
              <Typography variant="body2" color="text.secondary">
                Thông tin chi tiết khách hàng sẽ hiển thị ở đây
              </Typography>
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default OperationalDashboard;
