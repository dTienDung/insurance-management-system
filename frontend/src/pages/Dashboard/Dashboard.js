import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Stack,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button as MuiButton,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  DirectionsCar as CarIcon,
  Description as ContractIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as ActiveIcon,
  Cancel as ExpiredIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import reportService from '../../services/reportService';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Default: last 30 days
  const getDefaultFromDate = () => {
    return dayjs().subtract(30, 'day');
  };
  
  const getDefaultToDate = () => {
    return dayjs();
  };
  
  const [filters, setFilters] = useState({
    fromDate: getDefaultFromDate(),
    toDate: getDefaultToDate(),
    package: 'all',
    status: 'all'
  });
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalVehicles: 0,
    totalContracts: 0,
    totalRevenue: 0,
    activeContracts: 0,
    expiredContracts: 0,
    pendingContracts: 0,
    monthlyGrowth: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [contractData, setContractData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [pendingAssessments, setPendingAssessments] = useState([]);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const dashboardStats = await reportService.getDashboardStats();
      setStats(dashboardStats.data || {
        totalCustomers: 0,
        totalVehicles: 0,
        totalContracts: 0,
        totalRevenue: 0,
        activeContracts: 0,
        expiredContracts: 0,
        pendingContracts: 0,
        monthlyGrowth: 0
      });

      // Load revenue data with date range
      const revenueRes = await reportService.getMonthlyRevenue({ 
        fromDate: filters.fromDate.format('YYYY-MM-DD'), 
        toDate: filters.toDate.format('YYYY-MM-DD') 
      });
      const revenueMonthly = revenueRes.data || [];
      setRevenueData(revenueMonthly.map(item => ({
        month: item.nam ? `T${item.thang}/${item.nam}` : `T${item.thang}`,
        doanhThu: item.doanhThu / 1000000,
        soHopDong: item.soHopDong
      })));

      // Load contract by status
      const contractRes = await reportService.getContractsByStatus();
      const contractByStatus = contractRes.data || [];
      setContractData(contractByStatus.map(item => ({
        name: item.TrangThai,
        value: item.SoLuong
      })));

      // Load risk assessment data
      const riskRes = await reportService.getAssessmentsByRiskLevel();
      const riskByLevel = riskRes.data?.summary || [];
      setRiskData(riskByLevel.map(item => ({
        name: item.RiskLevel,
        value: item.SoLuongHoSo
      })));

      // Load expiring contracts (next 15 days)
      const expiringRes = await reportService.getExpiringContracts(15);
      setExpiringContracts((expiringRes.data || []).slice(0, 10));

      // Load pending assessments - use assessments API with status filter
      const pendingRes = await api.get('/assessments', { 
        params: { trangThai: 'Chờ thẩm định', limit: 10 } 
      });
      console.log('[Dashboard] Pending assessments response:', pendingRes);
      console.log('[Dashboard] Pending data:', pendingRes.data?.data);
      setPendingAssessments(pendingRes.data?.data || []);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    loadDashboardData();
  };

  const handleResetFilter = () => {
    setFilters({
      fromDate: getDefaultFromDate(),
      toDate: getDefaultToDate(),
      package: 'all',
      status: 'all'
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const StatCard = ({ title, value, icon: Icon, color, growth, subtitle, isCurrency = false }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h4" fontWeight="bold" color={color}>
                {isCurrency ? formatCurrency(value) : formatNumber(value)}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                bgcolor: `${color}.lighter`,
                borderRadius: 2,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon sx={{ fontSize: 32, color: color }} />
            </Box>
          </Stack>
          
          {growth !== undefined && (
            <Stack direction="row" spacing={1} alignItems="center">
              {growth >= 0 ? (
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
              ) : (
                <TrendingDownIcon sx={{ color: 'error.main', fontSize: 20 }} />
              )}
              <Typography
                variant="body2"
                color={growth >= 0 ? 'success.main' : 'error.main'}
                fontWeight="medium"
              >
                {Math.abs(growth)}% so với tháng trước
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng quan hệ thống quản lý bảo hiểm
            </Typography>
          </Box>
          <IconButton onClick={loadDashboardData} color="primary">
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Box>

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
              <InputLabel>Gói bảo hiểm</InputLabel>
              <Select
                value={filters.package}
                label="Gói bảo hiểm"
                onChange={(e) => setFilters({ ...filters, package: e.target.value })}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="coban">Cơ Bản</MenuItem>
                <MenuItem value="nangcao">Nâng Cao</MenuItem>
                <MenuItem value="toandien">Toàn Diện</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filters.status}
                label="Trạng thái"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="active">Hiệu lực</MenuItem>
                <MenuItem value="pending">Chờ duyệt</MenuItem>
                <MenuItem value="expired">Hết hạn</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Stack direction="row" spacing={1}>
              <MuiButton variant="contained" fullWidth onClick={handleApplyFilter}>
                Áp dụng
              </MuiButton>
              <MuiButton variant="outlined" onClick={handleResetFilter}>
                Xóa
              </MuiButton>
            </Stack>
          </Grid>
        </Grid>
        </LocalizationProvider>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng khách hàng"
            value={stats.totalCustomers || 0}
            icon={PeopleIcon}
            color="primary.main"
            growth={stats.customerGrowth}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng phương tiện"
            value={stats.totalVehicles || 0}
            icon={CarIcon}
            color="info.main"
            growth={stats.vehicleGrowth}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Hợp đồng hiệu lực"
            value={stats.activeContracts || 0}
            icon={ActiveIcon}
            color="success.main"
            subtitle={`Tổng: ${stats.totalContracts || 0} hợp đồng`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Doanh thu tháng"
            value={stats.monthlyRevenue || 0}
            icon={MoneyIcon}
            color="warning.main"
            growth={stats.monthlyGrowth}
            isCurrency={true}
          />
        </Grid>
      </Grid>

      {/* Secondary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: 'success.lighter', borderLeft: 4, borderColor: 'success.main' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Hợp đồng mới</Typography>
                <Typography variant="h5" fontWeight="bold">{stats.pendingContracts || 0}</Typography>
              </Box>
              <ContractIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.6 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: 'warning.lighter', borderLeft: 4, borderColor: 'warning.main' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Sắp hết hạn</Typography>
                <Typography variant="h5" fontWeight="bold">{stats.expiringContracts || 0}</Typography>
              </Box>
              <ExpiredIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.6 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: 'error.lighter', borderLeft: 4, borderColor: 'error.main' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Hợp đồng hết hạn</Typography>
                <Typography variant="h5" fontWeight="bold">{stats.expiredContracts || 0}</Typography>
              </Box>
              <ExpiredIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.6 }} />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Doanh thu theo tháng (triệu VNĐ)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'Doanh thu') {
                      return [value.toFixed(1) + 'M VNĐ', name];
                    }
                    return [formatNumber(value), name];
                  }} 
                />
                <Legend />
                <Bar dataKey="doanhThu" fill="#8884d8" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Contract Status Pie */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Hợp đồng theo trạng thái
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contractData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contractData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Risk Assessment Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Thẩm định theo mức rủi ro
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={riskData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" name="Số lượng" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Contract Growth */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Số lượng hợp đồng theo tháng
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />oltip />
                <Legend />
                <Line type="monotone" dataKey="soHopDong" stroke="#8884d8" name="Số hợp đồng" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Expiring Contracts Table */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Hợp đồng sắp hết hạn (15 ngày)
              </Typography>
              <MuiButton size="small" onClick={() => navigate('/contracts')}>
                Xem tất cả
              </MuiButton>
            </Stack>
            <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.875rem' }}>Số HĐ</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.875rem' }}>Khách hàng</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.875rem' }}>Biển số</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.875rem' }}>Hết hạn</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: '0.875rem' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringContracts.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
                        Không có hợp đồng sắp hết hạn
                      </td>
                    </tr>
                  ) : (
                    expiringContracts.map((contract, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px', fontSize: '0.875rem' }}>{contract.SoHD || contract.MaHD}</td>
                        <td style={{ padding: '8px', fontSize: '0.875rem' }}>{contract.TenKH}</td>
                        <td style={{ padding: '8px', fontSize: '0.875rem' }}>
                          <Chip label={contract.BienSo || '-'} size="small" color="primary" />
                        </td>
                        <td style={{ padding: '8px', fontSize: '0.875rem' }}>
                          {contract.NgayKetThuc ? formatDate(contract.NgayKetThuc) : '-'}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <Tooltip title="Xem chi tiết">
                            <IconButton 
                              size="small" 
                              onClick={() => navigate(`/contracts/${contract.MaHD}`)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>

        {/* Pending Assessments Table */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Hồ sơ chờ thẩm định
              </Typography>
              <MuiButton size="small" onClick={() => navigate('/assessments')}>
                Xem tất cả
              </MuiButton>
            </Stack>
            <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.875rem' }}>Mã HS</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.875rem' }}>Khách hàng</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.875rem' }}>Biển số</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.875rem' }}>Ngày tạo</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: '0.875rem' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAssessments.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
                        Không có hồ sơ chờ thẩm định
                      </td>
                    </tr>
                  ) : (
                    pendingAssessments.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px', fontSize: '0.875rem' }}>{item.MaHS}</td>
                        <td style={{ padding: '8px', fontSize: '0.875rem' }}>
                          {item.TenKhach || item.HoTen || item.MaKH}
                        </td>
                        <td style={{ padding: '8px', fontSize: '0.875rem' }}>
                          <Chip label={item.BienSo || '-'} size="small" color="warning" />
                        </td>
                        <td style={{ padding: '8px', fontSize: '0.875rem' }}>
                          {item.NgayLap ? formatDate(item.NgayLap) : '-'}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <Tooltip title="Xem chi tiết">
                            <IconButton 
                              size="small" 
                              onClick={() => navigate(`/hoso/${item.MaHS}`)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
