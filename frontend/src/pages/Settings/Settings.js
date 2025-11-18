// ============================================
// PJICO - Settings Page
// Trang Cài đặt hệ thống (Master Data Management)
// ============================================

import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HistoryIcon from '@mui/icons-material/History';

import AssessmentCriteria from './MasterData/AssessmentCriteria';
import PricingMatrix from './MasterData/PricingMatrix';
import AuditLog from './MasterData/AuditLog';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Settings() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Cài đặt hệ thống
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Quản lý dữ liệu cấu hình, ma trận định phí và xem lịch sử thay đổi
      </Typography>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="settings tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<AssessmentIcon />}
            iconPosition="start"
            label="Ma trận Thẩm định"
            id="settings-tab-0"
            aria-controls="settings-tabpanel-0"
          />
          <Tab
            icon={<AttachMoneyIcon />}
            iconPosition="start"
            label="Ma trận Định phí"
            id="settings-tab-1"
            aria-controls="settings-tabpanel-1"
          />
          <Tab
            icon={<HistoryIcon />}
            iconPosition="start"
            label="Lịch sử thay đổi"
            id="settings-tab-2"
            aria-controls="settings-tabpanel-2"
          />
        </Tabs>

        {/* Tab Panels */}
        <TabPanel value={currentTab} index={0}>
          <AssessmentCriteria />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <PricingMatrix />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <AuditLog />
        </TabPanel>
      </Paper>
    </Box>
  );
}

export default Settings;
