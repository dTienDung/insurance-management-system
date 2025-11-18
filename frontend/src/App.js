import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useTranslation } from './hooks/useTranslation';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import CustomerList from './pages/Customers/CustomerList';
import CustomerForm from './pages/Customers/CustomerForm';
import CustomerDetail from './pages/Customers/CustomerDetail';
import VehicleList from './pages/Vehicles/VehicleList';
import VehicleForm from './pages/Vehicles/VehicleForm';
import VehicleDetail from './pages/Vehicles/VehicleDetail';
import ContractList from './pages/Contracts/ContractList';
import ContractForm from './pages/Contracts/ContractForm';
import ContractDetail from './pages/Contracts/ContractDetail';
import AssessmentList from './pages/Assesments/AssessmentList';
import AssessmentForm from './pages/Assesments/AssessmentForm';
import AssessmentDetail from './pages/Assesments/AssessmentDetail';
import HoSoList from './pages/HoSoThamDinh/HoSoList';
import ReportDashboardNew from './pages/Reports/ReportDashboardNew';
import UserProfile from './pages/UserProfile/UserProfile';
import Settings from './pages/Settings/Settings';
import { pjicoTheme } from './theme';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <MainLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Customer Routes */}
                <Route path="/customers" element={<CustomerList />} />
                <Route path="/customers/new" element={<CustomerForm />} />
                <Route path="/customers/edit/:id" element={<CustomerForm />} />
                <Route path="/customers/:id" element={<CustomerDetail />} />

                {/* Vehicle Routes */}
                <Route path="/vehicles" element={<VehicleList />} />
                <Route path="/vehicles/new" element={<VehicleForm />} />
                <Route path="/vehicles/edit/:id" element={<VehicleForm />} />
                <Route path="/vehicles/:id" element={<VehicleDetail />} />

                {/* Contract Routes */}
                <Route path="/contracts" element={<ContractList />} />
                <Route path="/contracts/new" element={<ContractForm />} />
                <Route path="/contracts/edit/:id" element={<ContractForm />} />
                <Route path="/contracts/:id" element={<ContractDetail />} />

                {/* Assessment Routes */}
                <Route path="/assessments" element={<AssessmentList />} />
                <Route path="/assessments/new" element={<AssessmentForm />} />
                <Route path="/assessments/edit/:id" element={<AssessmentForm />} />
                <Route path="/assessments/:id" element={<AssessmentDetail />} />

                {/* HoSo Routes */}
                <Route path="/hoso" element={<HoSoList />} />
                <Route path="/hoso/:id" element={<AssessmentDetail />} />

                {/* Reports */}
                <Route path="/reports" element={<ReportDashboardNew />} />
                
                {/* Settings - Master Data Management */}
                <Route path="/settings" element={<Settings />} />
                
                {/* User Profile */}
                <Route path="/profile" element={<UserProfile />} />
                
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </MainLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  const { t } = useTranslation();
  
  useEffect(() => {
    document.title = t('app.title');
  }, [t]);

  return (
    <ThemeProvider theme={pjicoTheme}>
      <CssBaseline />
      <ConfigProvider locale={viVN}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ConfigProvider>
    </ThemeProvider>
  );
}

export default App;