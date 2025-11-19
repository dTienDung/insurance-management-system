import React, { useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Description as FileTextIcon } from '@mui/icons-material';

const Table = ({ 
  columns, 
  data, 
  onRowClick, 
  loading, 
  emptyMessage = 'Không có dữ liệu',
  pageSize = 10,
  rowCount,
  page,
  onPageChange,
  onPageSizeChange,
  paginationMode = 'client',
  getRowId,
  ...props 
}) => {
  console.log('[Table] Render with page:', page, 'pageSize:', pageSize, 'rowCount:', rowCount);
  console.log('[Table] getRowId prop received:', typeof getRowId, getRowId ? 'YES' : 'NO');
  console.log('[Table] First row sample:', data?.[0]);
  
  if (data?.[0] && getRowId) {
    const testId = getRowId(data[0]);
    console.log('[Table] Testing getRowId with first row, result:', testId);
  }
  
  // Memoize paginationModel to prevent unnecessary re-renders
  const paginationModel = useMemo(() => ({
    page: page !== undefined ? page : 0,
    pageSize: pageSize || 10
  }), [page, pageSize]);
  // Convert columns format if needed
  const muiColumns = columns.map(col => {
    // Xử lý renderCell - nếu có thì wrap lại để nhận params từ MUI
    let renderCell = col.renderCell;
    if (renderCell && typeof renderCell === 'function') {
      renderCell = (params) => col.renderCell(params.row, params);
    } else if (col.render && typeof col.render === 'function') {
      renderCell = (params) => col.render(params.row, params);
    }

    return {
      field: col.key || col.field,
      headerName: col.label || col.headerName,
      width: col.width || 150,
      flex: col.flex,
      sortable: col.sortable !== false,
      renderCell,
      ...col
    };
  });

  // Loading state
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight={400}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        alignItems="center" 
        justifyContent="center"
        minHeight={400}
        color="text.secondary"
      >
        <FileTextIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
        <Typography variant="body1">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <DataGrid
      rows={data}
      columns={muiColumns}
      loading={loading}
      pageSizeOptions={[5, 10, 25, 50, 100]}
      paginationMode={paginationMode}
      rowCount={rowCount || data.length}
      onPaginationModelChange={(model) => {
        console.log('[Table] onPaginationModelChange:', model, 'current page:', page);
        if (onPageChange && model.page !== page) {
          onPageChange(model.page);
        }
        if (onPageSizeChange && model.pageSize !== pageSize) {
          onPageSizeChange(model.pageSize);
        }
      }}
      paginationModel={paginationModel}
      disableRowSelectionOnClick
      onRowClick={(params) => onRowClick && onRowClick(params.row)}
      autoHeight
      sx={{
        border: 'none',
        '& .MuiDataGrid-cell:focus': {
          outline: 'none',
        },
        '& .MuiDataGrid-row:hover': {
          cursor: onRowClick ? 'pointer' : 'default',
          bgcolor: 'action.hover',
        },
        ...props.sx
      }}
      localeText={{
        noRowsLabel: emptyMessage,
        MuiTablePagination: {
          labelRowsPerPage: 'Số hàng mỗi trang:',
          labelDisplayedRows: ({ from, to, count }) =>
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`,
        },
      }}
      {...props}
      getRowId={getRowId || ((row) => row.id || row.MaHS || row.MaHD || row.MaKH || row.MaXe)}
    />
  );
};

export default Table;