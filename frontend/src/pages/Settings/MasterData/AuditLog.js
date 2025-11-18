import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Collapse
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CompareIcon from '@mui/icons-material/Compare';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import BarChartIcon from '@mui/icons-material/BarChart';
import auditLogService from '../../../services/auditLogService';

const ACTION_TYPES = [
  { value: 'INSERT', label: 'Thêm mới', color: 'success' },
  { value: 'UPDATE', label: 'Cập nhật', color: 'warning' },
  { value: 'DELETE', label: 'Xóa', color: 'error' }
];

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Filters
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    tableName: '',
    action: '',
    fromDate: '',
    toDate: '',
    changedBy: ''
  });
  
  // Tables list
  const [tables, setTables] = useState([]);
  
  // Expanded row details
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Statistics
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Compare versions
  const [showCompare, setShowCompare] = useState(false);
  const [compareData, setCompareData] = useState({
    tableName: '',
    recordId: '',
    version1: '',
    version2: ''
  });
  const [comparisonResult, setComparisonResult] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  useEffect(() => {
    loadLogs();
    loadTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  useEffect(() => {
    // Reload logs when filters change
    if (page === 0) {
      loadLogs();
    } else {
      setPage(0); // This will trigger loadLogs via the first useEffect
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadTables = async () => {
    try {
      const data = await auditLogService.getTables();
      setTables(data);
    } catch (err) {
      console.error('Error loading tables:', err);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });
      
      const data = await auditLogService.getAll(params);
      setLogs(data.data || []);
      setTotalRecords(data.pagination?.totalRecords || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải lịch sử thay đổi');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });
      
      const data = await auditLogService.getStats(params);
      setStats(data);
      setShowStats(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải thống kê');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      tableName: '',
      action: '',
      fromDate: '',
      toDate: '',
      changedBy: ''
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExpandRow = (logId) => {
    setExpandedRow(expandedRow === logId ? null : logId);
  };

  const handleExport = async () => {
    try {
      const params = { ...filters };
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });
      
      const blob = await auditLogService.exportToCsv(params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Xuất file CSV thành công');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xuất file CSV');
    }
  };

  const handleCompare = async () => {
    if (!compareData.tableName || !compareData.recordId || !compareData.version1 || !compareData.version2) {
      setError('Vui lòng nhập đầy đủ thông tin để so sánh');
      return;
    }

    setCompareLoading(true);
    try {
      const result = await auditLogService.compareVersions({
        tableName: compareData.tableName,
        recordId: parseInt(compareData.recordId),
        version1: parseInt(compareData.version1),
        version2: parseInt(compareData.version2)
      });
      setComparisonResult(result);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi so sánh phiên bản');
      setComparisonResult(null);
    } finally {
      setCompareLoading(false);
    }
  };

  const getActionLabel = (action) => {
    const actionType = ACTION_TYPES.find(a => a.value === action);
    return actionType ? actionType.label : action;
  };

  const getActionColor = (action) => {
    const actionType = ACTION_TYPES.find(a => a.value === action);
    return actionType ? actionType.color : 'default';
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const renderChangeDetail = (log) => {
    if (!log.OldValue && !log.NewValue) {
      return <Typography variant="body2" color="text.secondary">Không có dữ liệu chi tiết</Typography>;
    }

    const oldData = log.OldValue ? JSON.parse(log.OldValue) : {};
    const newData = log.NewValue ? JSON.parse(log.NewValue) : {};
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Trường</TableCell>
              <TableCell>Giá trị cũ</TableCell>
              <TableCell>Giá trị mới</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from(allKeys).map(key => (
              <TableRow key={key}>
                <TableCell><strong>{key}</strong></TableCell>
                <TableCell>
                  {oldData[key] !== undefined ? (
                    <Chip label={String(oldData[key])} size="small" color="error" variant="outlined" />
                  ) : (
                    <Typography variant="body2" color="text.disabled">-</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {newData[key] !== undefined ? (
                    <Chip label={String(newData[key])} size="small" color="success" variant="outlined" />
                  ) : (
                    <Typography variant="body2" color="text.disabled">-</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Lịch sử Thay đổi
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<BarChartIcon />}
            onClick={loadStats}
            disabled={statsLoading}
          >
            Thống kê
          </Button>
          <Button
            variant="outlined"
            startIcon={<CompareIcon />}
            onClick={() => setShowCompare(true)}
          >
            So sánh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Xuất CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Ẩn lọc' : 'Hiện lọc'}
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Statistics */}
      <Collapse in={showStats}>
        {stats && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống kê
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">Tổng số thay đổi</Typography>
                    <Typography variant="h4" fontWeight="bold">{stats.totalChanges || 0}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">Thêm mới</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.byAction?.find(a => a.Action === 'INSERT')?.Count || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">Cập nhật</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.byAction?.find(a => a.Action === 'UPDATE')?.Count || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">Xóa</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.byAction?.find(a => a.Action === 'DELETE')?.Count || 0}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {stats.byTable && stats.byTable.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>Theo bảng</Typography>
                  <Grid container spacing={1}>
                    {stats.byTable.map(item => (
                      <Grid item xs={12} md={4} key={item.TableName}>
                        <Chip
                          label={`${item.TableName}: ${item.Count}`}
                          variant="outlined"
                          sx={{ width: '100%' }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              
              <Button
                size="small"
                onClick={() => setShowStats(false)}
                sx={{ mt: 2 }}
              >
                Đóng
              </Button>
            </CardContent>
          </Card>
        )}
      </Collapse>

      {/* Filters */}
      <Collapse in={showFilters}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Bảng</InputLabel>
                <Select
                  value={filters.tableName}
                  label="Bảng"
                  onChange={(e) => handleFilterChange('tableName', e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {tables.map(table => (
                    <MenuItem key={table} value={table}>{table}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Hành động</InputLabel>
                <Select
                  value={filters.action}
                  label="Hành động"
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {ACTION_TYPES.map(action => (
                    <MenuItem key={action.value} value={action.value}>{action.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Từ ngày"
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Đến ngày"
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Người thay đổi"
                value={filters.changedBy}
                onChange={(e) => handleFilterChange('changedBy', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                size="small"
                onClick={handleClearFilters}
                variant="outlined"
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {/* Data Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="50px"></TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Bảng</TableCell>
              <TableCell>Bản ghi</TableCell>
              <TableCell>Hành động</TableCell>
              <TableCell>Người thay đổi</TableCell>
              <TableCell>Thời gian</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <React.Fragment key={log.ID}>
                  <TableRow hover>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleExpandRow(log.ID)}
                      >
                        {expandedRow === log.ID ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{log.ID}</TableCell>
                    <TableCell>
                      <Chip label={log.TableName} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{log.RecordID}</TableCell>
                    <TableCell>
                      <Chip
                        label={getActionLabel(log.Action)}
                        color={getActionColor(log.Action)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{log.ChangedBy}</TableCell>
                    <TableCell>{formatDateTime(log.ChangedAt)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={7} sx={{ p: 0 }}>
                      <Collapse in={expandedRow === log.ID} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Chi tiết thay đổi
                          </Typography>
                          {renderChangeDetail(log)}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalRecords}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong tổng số ${count}`}
        />
      </TableContainer>

      {/* Compare Versions Dialog */}
      <Dialog open={showCompare} onClose={() => setShowCompare(false)} maxWidth="md" fullWidth>
        <DialogTitle>So sánh Phiên bản</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Bảng</InputLabel>
              <Select
                value={compareData.tableName}
                label="Bảng"
                onChange={(e) => setCompareData({ ...compareData, tableName: e.target.value })}
              >
                {tables.map(table => (
                  <MenuItem key={table} value={table}>{table}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="ID bản ghi"
              type="number"
              value={compareData.recordId}
              onChange={(e) => setCompareData({ ...compareData, recordId: e.target.value })}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Phiên bản 1"
                  type="number"
                  value={compareData.version1}
                  onChange={(e) => setCompareData({ ...compareData, version1: e.target.value })}
                  helperText="ID log cũ hơn"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Phiên bản 2"
                  type="number"
                  value={compareData.version2}
                  onChange={(e) => setCompareData({ ...compareData, version2: e.target.value })}
                  helperText="ID log mới hơn"
                />
              </Grid>
            </Grid>
            
            <Button
              variant="contained"
              onClick={handleCompare}
              disabled={compareLoading}
            >
              {compareLoading ? <CircularProgress size={24} /> : 'So sánh'}
            </Button>
            
            {comparisonResult && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Kết quả so sánh
                </Typography>
                {comparisonResult.changes && comparisonResult.changes.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Trường</TableCell>
                          <TableCell>Phiên bản 1</TableCell>
                          <TableCell>Phiên bản 2</TableCell>
                          <TableCell>Thay đổi</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {comparisonResult.changes.map((change, idx) => (
                          <TableRow key={idx}>
                            <TableCell><strong>{change.field}</strong></TableCell>
                            <TableCell>
                              <Chip label={change.oldValue || '-'} size="small" color="error" variant="outlined" />
                            </TableCell>
                            <TableCell>
                              <Chip label={change.newValue || '-'} size="small" color="success" variant="outlined" />
                            </TableCell>
                            <TableCell>
                              <Chip label={change.changed ? 'Đã thay đổi' : 'Không đổi'} 
                                    size="small" 
                                    color={change.changed ? 'warning' : 'default'} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">Không có sự khác biệt giữa hai phiên bản</Alert>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowCompare(false);
            setComparisonResult(null);
            setCompareData({ tableName: '', recordId: '', version1: '', version2: '' });
          }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditLog;
