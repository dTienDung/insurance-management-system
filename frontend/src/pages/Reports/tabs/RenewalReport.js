import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Button,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import {
  PictureAsPdf,
  Description,
  Print
} from '@mui/icons-material';
import reportService from '../../../services/reportService';

const RenewalReport = () => {
  const [filters, setFilters] = useState({
    fromDate: dayjs().subtract(30, 'day'),
    toDate: dayjs()
  });

  const [reportData, setReportData] = useState({
    totalExpiring: 0,
    renewed: 0,
    notRenewed: 0,
    renewalRate: 0,
    reasonsNotRenewed: [],
    discountAnalysis: {
      withDiscount: 0,
      withoutDiscount: 0,
      averageDiscount: 0
    },
    contractsList: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Only load once initially or when dates change significantly (user action)
    if (!hasLoaded || filters.fromDate || filters.toDate) {
      loadReportData();
      setHasLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.fromDate?.format('YYYY-MM-DD'), filters.toDate?.format('YYYY-MM-DD')]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await reportService.getRenewalReport({
        fromDate: filters.fromDate.format('YYYY-MM-DD'),
        toDate: filters.toDate.format('YYYY-MM-DD')
      });

      if (response.success) {
        const data = response.data || {};
        setReportData({
          totalExpiring: data.totalExpiring || 0,
          renewed: data.renewed || 0,
          notRenewed: data.notRenewed || 0,
          renewalRate: data.renewalRate || 0,
          reasonsNotRenewed: data.reasonsNotRenewed || [],
          discountAnalysis: data.discountAnalysis || { withDiscount: 0, withoutDiscount: 0, averageDiscount: 0 },
          contractsList: data.contracts || []
        });
      }
    } catch (err) {
      console.error('Error loading renewal report:', err);
      setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      const year = filters.fromDate.year();
      await reportService.exportRenewalPDF(year);
      alert('Xuất PDF thành công!');
    } catch (err) {
      setError('Đã xảy ra lỗi khi xuất PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

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

            <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" startIcon={<Print />} disabled={loading}>
                Xem trước
              </Button>
              <Button variant="contained" startIcon={<PictureAsPdf />} onClick={handleExportPDF} disabled={loading}>
                Xuất PDF
              </Button>
              <Button variant="contained" color="success" startIcon={<Description />} disabled={loading}>
                Xuất Excel
              </Button>
            </Stack>
          </Grid>
        </Grid>
        </LocalizationProvider>
      </Paper>

      {/* Report Preview */}
      <Paper sx={{ p: 4, minHeight: 800 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && (
          <>
        {/* Header - Mẫu hành chính */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" fontWeight={600}>
              TỔNG CÔNG TY BẢO HIỂM PETROLIMEX
            </Typography>
            <Typography variant="caption">PJICO</Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography variant="subtitle2" fontWeight={600}>
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </Typography>
            <Typography variant="caption">Độc lập – Tự do – Hạnh phúc</Typography>
          </Grid>
        </Grid>

        <Box textAlign="center" sx={{ my: 4 }}>
          <Typography variant="caption">Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</Typography>
          <Typography variant="h5" fontWeight={700} sx={{ my: 2 }}>
            BÁO CÁO TÁI TỤC BẢO HIỂM
          </Typography>
          <Typography variant="subtitle2">
            Kỳ báo cáo: {filters.timeType === 'year' ? 'Năm' : filters.timeType === 'quarter' ? 'Quý' : 'Tháng'} {filters.year}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* I. Tổng quan tái tục */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            I. TỔNG QUAN TÁI TỤC
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Chỉ tiêu</strong></TableCell>
                  <TableCell align="right"><strong>Số lượng</strong></TableCell>
                  <TableCell align="right"><strong>Tỷ lệ (%)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Tổng HĐ đáo hạn</TableCell>
                  <TableCell align="right">{reportData.totalExpiring}</TableCell>
                  <TableCell align="right">100%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Đã tái tục</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>{reportData.renewed}</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>{reportData.renewalRate}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Không tái tục</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>{reportData.notRenewed}</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>{100 - reportData.renewalRate}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* II. Phân tích lý do không tái tục */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            II. PHÂN TÍCH LÝ DO KHÔNG TÁI TỤC
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Lý do</strong></TableCell>
                  <TableCell align="right"><strong>Số lượng</strong></TableCell>
                  <TableCell align="right"><strong>Tỷ trọng (%)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.reasonsNotRenewed.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.reason}</TableCell>
                    <TableCell align="right">{item.count}</TableCell>
                    <TableCell align="right">{item.percentage}%</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell><strong>Tổng cộng</strong></TableCell>
                  <TableCell align="right"><strong>{reportData.notRenewed}</strong></TableCell>
                  <TableCell align="right"><strong>100%</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* III. Phân tích ưu đãi tái tục */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            III. PHÂN TÍCH ƯU ĐÃI TÁI TỤC
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Chỉ tiêu</strong></TableCell>
                  <TableCell align="right"><strong>Giá trị</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>HĐ tái tục có ưu đãi</TableCell>
                  <TableCell align="right">{reportData.discountAnalysis.withDiscount}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>HĐ tái tục không ưu đãi</TableCell>
                  <TableCell align="right">{reportData.discountAnalysis.withoutDiscount}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Mức ưu đãi trung bình</TableCell>
                  <TableCell align="right">{reportData.discountAnalysis.averageDiscount}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* IV. Đánh giá và khuyến nghị */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            IV. ĐÁNH GIÁ VÀ KHUYẾN NGHỊ
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>1. Đánh giá chung:</strong>
          </Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}>
            - Tỷ lệ tái tục đạt {reportData.renewalRate}%, đạt mục tiêu kế hoạch đề ra.
          </Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}>
            - Lý do chính khách hàng không tái tục là chuyển sang nhà bảo hiểm khác ({reportData.reasonsNotRenewed[0].percentage}%).
          </Typography>

          <Typography variant="body2" paragraph sx={{ mt: 2 }}>
            <strong>2. Khuyến nghị:</strong>
          </Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}>
            - Cần tăng cường chương trình ưu đãi khách hàng tái tục.
          </Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}>
            - Đào tạo đội ngũ chăm sóc khách hàng để nâng cao chất lượng dịch vụ.
          </Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}>
            - Rà soát chính sách giá cả để cạnh tranh tốt hơn với thị trường.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Signature Section */}
        <Grid container spacing={4} sx={{ mt: 6 }}>
          <Grid item xs={6} textAlign="center">
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              PHỤ TRÁCH BỘ PHẬN
            </Typography>
            <Typography variant="caption" display="block" sx={{ mb: 8 }}>
              (Ký, ghi rõ họ tên)
            </Typography>
            <Typography variant="body2">____________________</Typography>
          </Grid>
          <Grid item xs={6} textAlign="center">
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              NGƯỜI BÁO CÁO
            </Typography>
            <Typography variant="caption" display="block" sx={{ mb: 8 }}>
              (Ký, ghi rõ họ tên)
            </Typography>
            <Typography variant="body2">____________________</Typography>
          </Grid>
        </Grid>
        </>
        )}
      </Paper>
    </Box>
  );
};

export default RenewalReport;
