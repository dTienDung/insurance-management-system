import React, { useState } from 'react';
import {
  Container,
  Box,
  Tabs,
  Tab,
  Typography
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Autorenew as RenewIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

// Import 4 tab components
import OperationalDashboard from './tabs/OperationalDashboard';
import RevenueReport from './tabs/RevenueReport';
import RenewalReport from './tabs/RenewalReport';
import AssessmentSupportReport from './tabs/AssessmentSupportReport';

const ReportDashboardNew = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      label: 'Quản trị Nghiệp vụ',
      icon: <BarChartIcon />,
      component: <OperationalDashboard />
    },
    {
      label: 'Doanh thu Phí BH',
      icon: <TrendingUpIcon />,
      component: <RevenueReport />
    },
    {
      label: 'Tái tục Hợp đồng',
      icon: <RenewIcon />,
      component: <RenewalReport />
    },
    {
      label: 'Hỗ trợ Thẩm định',
      icon: <AssessmentIcon />,
      component: <AssessmentSupportReport />
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Hệ thống Báo cáo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quản lý và xuất báo cáo nghiệp vụ theo chuẩn hành chính
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box>
        {tabs[activeTab].component}
      </Box>
    </Container>
  );
};

export default ReportDashboardNew;
