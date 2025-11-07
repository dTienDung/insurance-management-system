import React, { useState, useEffect } from 'react';
import { dashboardAPI, exportAPI } from '../../services/api';
import { downloadExcel } from '../../utils/fileDownload';
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

const ReportDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalContracts: 0,
    renewalRate: 0,
    avgContractValue: 0
  });

  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Try the preferred methods; fall back to available endpoints in api.js
      let overviewResp, revenueResp;
      try {
        overviewResp = await dashboardAPI.getOverview(dateRange);
        revenueResp = await dashboardAPI.getRevenueByMonth(dateRange);
      } catch (err) {
        // fallback to generic endpoints
        try {
          overviewResp = await dashboardAPI.getStats();
        } catch (err2) {
          console.warn('dashboardAPI.getStats failed', err2);
          overviewResp = null;
        }
        try {
          // attempt to call getRevenue with year extracted from dateRange.start
          const year = new Date(dateRange.start).getFullYear();
          revenueResp = await dashboardAPI.getRevenue(year);
        } catch (err3) {
          console.warn('dashboardAPI.getRevenue fallback failed', err3);
          revenueResp = null;
        }
      }

      const overviewData = overviewResp?.data?.data || overviewResp?.data || overviewResp || {};
      const revenueData = revenueResp?.data?.data || revenueResp?.data || revenueResp || [];

      setStats(overviewData || {});
      setRevenueByMonth(Array.isArray(revenueData) ? revenueData : (revenueData.months || []));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (type) => {
    try {
      let response;
      try {
        response = await exportAPI.exportReport(type, dateRange);
      } catch (err) {
        // fallback to generic exportAll
        response = await exportAPI.exportAll(type);
      }
      // response may be blob or axios response with data
      const blobData = response?.data || response;
      downloadExcel(blobData, `BaoCao_${type}_${new Date().toISOString().split('T')[0]}`);
      alert('✅ Xuất báo cáo thành công!');
    } catch (error) {
      alert('❌ Không thể xuất báo cáo');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Báo cáo & Thống kê</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>Tổng hợp số liệu kinh doanh</Typography>
      </Box>

      {/* Date Range Filter */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'flex-end' }}>
        <TextField
          label="Từ ngày"
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Đến ngày"
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={fetchReports} sx={{ ml: 'auto' }}>Xem báo cáo</Button>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, color: 'white', background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Tổng doanh thu</Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
              {new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(stats.totalRevenue)} đ
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>+12% so với tháng trước</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, color: 'white', background: 'linear-gradient(135deg,#10b981,#059669)' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Hợp đồng mới</Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>{stats.totalContracts}</Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>+5% so với tháng trước</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, color: 'white', background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Tỷ lệ tái tục</Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>{stats.renewalRate}%</Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>+3% so với tháng trước</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, color: 'white', background: 'linear-gradient(135deg,#fb923c,#f97316)' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Giá trị TB/HĐ</Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
              {new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(stats.avgContractValue)} đ
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>+8% so với tháng trước</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Revenue Chart (Table) */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Doanh thu theo tháng</Typography>
          <Button variant="outlined" onClick={() => handleExportReport('revenue')}>📊 Xuất Excel</Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tháng</TableCell>
                <TableCell align="right">Doanh thu</TableCell>
                <TableCell align="right">Số HĐ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {revenueByMonth.map((item, index) => (
                <TableRow key={index} hover>
                  <TableCell>{item.month}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{new Intl.NumberFormat('vi-VN').format(item.revenue)} đ</TableCell>
                  <TableCell align="right">{item.contracts}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Export Actions */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Xuất báo cáo</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="outlined" onClick={() => handleExportReport('revenue')}>📈 Báo cáo doanh thu</Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="outlined" onClick={() => handleExportReport('contracts')}>📄 Báo cáo hợp đồng</Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="outlined" onClick={() => handleExportReport('customers')}>👥 Báo cáo khách hàng</Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ReportDashboard;
