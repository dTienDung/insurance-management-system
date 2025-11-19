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
  Divider
  // TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
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
import { formatCurrency } from '../../../utils/formatters';
// import { formatDate } from '../../../utils/formatters';

const OperationalDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: dayjs().subtract(30, 'day'),
    toDate: dayjs(),
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
  // const [customerList] = useState([]); // Not used
  const [revenueData, setRevenueData] = useState([]);
  // const [renewalData] = useState([]); // Not used
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCustomer] = useState(null); // Used in Drawer conditional rendering

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Prepare query params
      const params = {
        status: filters.status === 'all' ? undefined : filters.status,
        package: filters.package === 'all' ? undefined : filters.package
      };

      // Add date range if specified
      if (filters.fromDate) {
        params.fromDate = filters.fromDate.format('YYYY-MM-DD');
      }
      if (filters.toDate) {
        params.toDate = filters.toDate.format('YYYY-MM-DD');
      }

      // Call backend API
      const response = await reportService.getOperationalDashboard(params);

      if (response.success && response.data) {
        const data = response.data;

        // Set KPIs
        setKpis({
          totalContracts: data.kpis?.totalContracts || 0,
          newContracts: data.kpis?.newContracts || 0,
          activeContracts: data.kpis?.activeContracts || 0,
          expiringContracts: data.kpis?.expiringContracts || 0,
          renewalRate: 78.5 // TODO: Calculate from backend
        });

        // Set revenue trend (transform to chart format)
        if (data.revenueTrend && data.revenueTrend.length > 0) {
          setRevenueData(data.revenueTrend.map((item, index) => ({
            month: `T${index + 1}`,
            total: Math.round(item.revenue / 1000000), // Convert to millions
            coban: 0, // TODO: Need breakdown by package from backend
            nangcao: 0,
            toandien: 0
          })));
        }

        // Set contract list
        setContractList(data.contracts || []);
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Fallback to empty data on error
      setKpis({
        totalContracts: 0,
        newContracts: 0,
        activeContracts: 0,
        expiringContracts: 0,
        renewalRate: 0
      });
      setRevenueData([]);
      setContractList([]);
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

  const handleFilterReset = () => {
    setFilters({
      fromDate: dayjs().subtract(30, 'day'),
      toDate: dayjs(),
      status: 'all',
      package: 'all'
    });
  };

  // const handleViewCustomerDetail = (customer) => {
  //   setSelectedCustomer(customer);
  //   setDrawerOpen(true);
  // };

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
    { field: 'contractNumber', headerName: 'Số HĐ', width: 120 },
    { field: 'customerName', headerName: 'Khách hàng', width: 180 },
    { field: 'licensePlate', headerName: 'Biển số', width: 120 },
    { 
      field: 'packageName', 
      headerName: 'Gói bảo hiểm', 
      width: 150,
      renderCell: (params) => {
        const value = params.value || '';
        return (
          <Chip 
            label={value} 
            size="small"
            color={
              value.includes('Cơ Bản') || value.includes('CO BAN') ? 'default' :
              value.includes('Nâng Cao') || value.includes('NANG CAO') ? 'primary' : 'success'
            }
          />
        );
      }
    },
    { 
      field: 'startDate', 
      headerName: 'Ngày hiệu lực', 
      width: 120,
      valueFormatter: (params) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString('vi-VN');
      }
    },
    { 
      field: 'endDate', 
      headerName: 'Ngày hết hạn', 
      width: 120,
      valueFormatter: (params) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString('vi-VN');
      }
    },
    { 
      field: 'status', 
      headerName: 'Trạng thái', 
      width: 140,
      renderCell: (params) => {
        const value = params.value || '';
        const statusMap = {
          'Mới': { color: 'info', label: 'Mới phát hành' },
          'Active': { color: 'success', label: 'Đang hiệu lực' },
          'ACTIVE': { color: 'success', label: 'Đang hiệu lực' },
          'Hiệu lực': { color: 'success', label: 'Đang hiệu lực' },
          'Expiring': { color: 'warning', label: 'Sắp hết hạn' },
          'Expired': { color: 'default', label: 'Đã hết hạn' },
          'EXPIRED': { color: 'default', label: 'Đã hết hạn' }
        };
        const config = statusMap[value] || { color: 'default', label: value };
        return <Chip label={config.label} color={config.color} size="small" />;
      }
    },
    { 
      field: 'premium', 
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
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Từ ngày"
                value={filters.fromDate}
                onChange={(newValue) => setFilters({ ...filters, fromDate: newValue })}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <DatePicker
                label="Đến ngày"
                value={filters.toDate}
                onChange={(newValue) => setFilters({ ...filters, toDate: newValue })}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
              />
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
              <Button variant="outlined" onClick={handleFilterReset} fullWidth>
                Reset
              </Button>
            </Stack>
          </Grid>
        </Grid>
        </LocalizationProvider>
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
            getRowId={(row) => row.contractNumber || row.MaHD || Math.random()}
            loading={loading}
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
