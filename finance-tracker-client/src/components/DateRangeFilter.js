import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Box } from '@mui/material';

const DateRangeFilter = ({ dateRange, onDateRangeChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <DatePicker
          label="Start Date"
          value={dateRange.start}
          onChange={(newValue) => {
            onDateRangeChange({
              ...dateRange,
              start: newValue
            });
          }}
        />
        <DatePicker
          label="End Date"
          value={dateRange.end}
          onChange={(newValue) => {
            onDateRangeChange({
              ...dateRange,
              end: newValue
            });
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangeFilter; 