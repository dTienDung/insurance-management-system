import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import {
  UserOutlined,
  CarOutlined,
  FileProtectOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalVehicles: 0,
    totalContracts: 0,
    totalRevenue: 0,
    activeContracts: 0,
    expiredContracts: 0,
    monthlyGrowth: 0,
    yearlyGrowth: 0
  });

  useEffect(() => {
    // Function định nghĩa bên trong useEffect để tránh hoisting error
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Mock data - sau này sẽ gọi API thật
        setTimeout(() => {
          setStats({
            totalCustomers: 456,
            totalVehicles: 567,
            totalContracts: 1234,
            totalRevenue: 5678900000,
            activeContracts: 892,
            expiredContracts: 234,
            monthlyGrowth: 12.5,
            yearlyGrowth: 23.8
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  // Format number
  const formatNumber = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard - Tổng quan hệ thống</h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng khách hàng"
              value={stats.totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
              formatter={(value) => formatNumber(value)}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng xe"
              value={stats.totalVehicles}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#1890ff' }}
              formatter={(value) => formatNumber(value)}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng hợp đồng"
              value={stats.totalContracts}
              prefix={<FileProtectOutlined />}
              valueStyle={{ color: '#cf1322' }}
              formatter={(value) => formatNumber(value)}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card title="Hợp đồng hiệu lực">
            <Statistic
              value={stats.activeContracts}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix={` / ${stats.totalContracts}`}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <Card title="Hợp đồng hết hạn">
            <Statistic
              value={stats.expiredContracts}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowDownOutlined />}
              suffix={` / ${stats.totalContracts}`}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <Card title="Tăng trưởng">
            <div>
              <p>Tháng này: <span style={{ color: '#3f8600', fontWeight: 'bold' }}>
                +{stats.monthlyGrowth}%
              </span></p>
              <p>Năm nay: <span style={{ color: '#3f8600', fontWeight: 'bold' }}>
                +{stats.yearlyGrowth}%
              </span></p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;