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
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  DirectionsCar as CarIcon,
  Description as ContractIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as ActiveIcon,
  Cancel as ExpiredIcon
} from '@mui/icons-material';
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
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import reportService from '../../services/reportService';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadDashboardData();
  }, []);

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

      // Load revenue data
      const year = new Date().getFullYear();
      const revenueRes = await reportService.getMonthlyRevenue({ year });
      const revenueMonthly = revenueRes.data || [];
      setRevenueData(revenueMonthly.map(item => ({
        month: `T${item.thang}`,
        doanhThu: item.doanhThu / 1000000, // Convert to millions
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
      const riskByLevel = riskRes.data || [];
      setRiskData(riskByLevel.map(item => ({
        name: item.RiskLevel,
        value: item.SoLuong
      })));

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tổng quan hệ thống quản lý bảo hiểm
        </Typography>
      </Box>

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
                <Tooltip />
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
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="soHopDong" stroke="#8884d8" name="Số hợp đồng" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
