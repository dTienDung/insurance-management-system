// ============================================
// TABLE WITH INLINE SEARCH
// Bảng có dòng search ngay dưới header
// ============================================

import React, { useState, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Paper,
  CircularProgress,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

/**
 * Table với dòng search inline (như ảnh)
 * 
 * @param {Array} columns - Cấu hình cột: [{ field, headerName, width, searchable, renderCell }]
 * @param {Array} data - Dữ liệu hiển thị
 * @param {Boolean} loading - Trạng thái loading
 * @param {Function} onRowClick - Callback khi click vào row
 * @param {String} emptyMessage - Text hiển thị khi không có data
 */
const TableWithSearch = ({
  columns = [],
  data = [],
  loading = false,
  onRowClick,
  emptyMessage = 'Không có dữ liệu',
  pageSize = 10,
  getRowId = (row) => row.id,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  
  // State cho search của từng column
  const [searchValues, setSearchValues] = useState({});

  // Filter data dựa trên search values
  const filteredData = useMemo(() => {
    if (Object.keys(searchValues).length === 0) return data;

    return data.filter((row) => {
      return Object.entries(searchValues).every(([field, searchTerm]) => {
        if (!searchTerm) return true;
        
        const cellValue = row[field];
        if (cellValue === null || cellValue === undefined) return false;
        
        return String(cellValue)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchValues]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleSearchChange = (field, value) => {
    setSearchValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(0); // Reset về trang đầu khi search
  };

  const handleClearSearch = (field) => {
    setSearchValues((prev) => {
      const newValues = { ...prev };
      delete newValues[field];
      return newValues;
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          {/* HEADER ROW */}
          <TableHead>
            <TableRow sx={{ bgcolor: '#1976d2' }}>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  sx={{
                    width: column.width || 'auto',
                    fontWeight: 'bold',
                    color: 'white',
                    borderRight: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>

            {/* SEARCH ROW - Ngay dưới header */}
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              {columns.map((column) => (
                <TableCell
                  key={`search-${column.field}`}
                  sx={{
                    py: 1,
                    px: 1,
                    borderRight: '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  {column.searchable !== false && (
                    <TextField
                      size="small"
                      placeholder={`Tìm ${column.headerName.toLowerCase()}...`}
                      value={searchValues[column.field] || ''}
                      onChange={(e) => handleSearchChange(column.field, e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: searchValues[column.field] && (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => handleClearSearch(column.field)}
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        bgcolor: 'white',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(0,0,0,0.2)',
                          },
                        },
                      }}
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* BODY */}
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={getRowId(row)}
                  hover
                  onClick={() => onRowClick && onRowClick(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': {
                      bgcolor: onRowClick ? 'action.hover' : 'transparent',
                    },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={`${getRowId(row)}-${column.field}`}
                      sx={{ borderRight: '1px solid rgba(0,0,0,0.05)' }}
                    >
                      {column.renderCell
                        ? column.renderCell(row)
                        : row[column.field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số dòng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} trong tổng số ${count !== -1 ? count : `hơn ${to}`}`
        }
      />
    </Box>
  );
};

export default TableWithSearch;
