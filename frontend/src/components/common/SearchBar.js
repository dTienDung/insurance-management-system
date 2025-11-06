import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const SearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  onSearch, 
  placeholder = 'Tìm kiếm...', 
  filters = [],
  actions = []
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2}
        alignItems="center"
      >
        {/* Search Input */}
        <TextField
          fullWidth
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && onSearch) {
              onSearch();
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          size="small"
        />

        {/* Search Button (optional) */}
        {onSearch && (
          <Button 
            variant="outlined" 
            onClick={onSearch}
            sx={{ minWidth: 120 }}
          >
            Tìm kiếm
          </Button>
        )}

        {/* Filters */}
        {filters.length > 0 && (
          <Stack direction="row" spacing={2}>
            {filters.map((filter, index) => (
              <FormControl key={index} size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{filter.label || 'Filter'}</InputLabel>
                <Select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  label={filter.label || 'Filter'}
                >
                  {filter.options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          </Stack>
        )}

        {/* Action Buttons */}
        {actions.length > 0 && (
          <Stack direction="row" spacing={1}>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'contained'}
                color={action.color || 'primary'}
                onClick={action.onClick}
                startIcon={action.icon}
                sx={{ minWidth: 100 }}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default SearchBar;