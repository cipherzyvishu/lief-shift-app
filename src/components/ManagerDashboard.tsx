'use client';

import React from 'react';
import { Card, Typography, Space, Button, Tag, Divider, Row, Col, Tabs } from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  SettingOutlined,
  TeamOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import ActiveStaffTable from './dashboard/ActiveStaffTable';
import ShiftHistoryTable from './dashboard/ShiftHistoryTable';
import LocationManagement from './dashboard/LocationManagement';

const { Title, Text, Paragraph } = Typography;

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
}

interface ManagerDashboardProps {
  user: User;
}

export default function ManagerDashboard({ user }: ManagerDashboardProps) {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Section */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space direction="vertical" size="small">
              <Title level={2} style={{ margin: 0 }}>
                <UserOutlined /> Manager Dashboard
              </Title>
              <Text type="secondary">
                Welcome back, {user.name || user.email}
              </Text>
              <div>
                <Tag color="gold" icon={<UserOutlined />}>
                  {user.role}
                </Tag>
                <Text type="secondary" style={{ marginLeft: '12px' }}>
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Button type="primary" icon={<SettingOutlined />}>
              Settings
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Quick Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <TeamOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
              <Title level={3} style={{ margin: '8px 0 4px 0' }}>
                --
              </Title>
              <Text type="secondary">Staff Clocked In</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '8px' }} />
              <Title level={3} style={{ margin: '8px 0 4px 0' }}>
                --
              </Title>
              <Text type="secondary">Avg Hours Today</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <BarChartOutlined style={{ fontSize: '32px', color: '#722ed1', marginBottom: '8px' }} />
              <Title level={3} style={{ margin: '8px 0 4px 0' }}>
                --
              </Title>
              <Text type="secondary">Total Shifts This Week</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Content Areas */}
      <Row gutter={[16, 16]}>
        {/* Left Column - Staff Management */}
        <Col xs={24} lg={14}>
          {/* Staff Management Tabs */}
          <Tabs
            defaultActiveKey="active"
            items={[
              {
                key: 'active',
                label: (
                  <span>
                    <EyeOutlined />
                    Active Staff
                  </span>
                ),
                children: <ActiveStaffTable />
              },
              {
                key: 'history',
                label: (
                  <span>
                    <HistoryOutlined />
                    Shift History
                  </span>
                ),
                children: <ShiftHistoryTable />
              },
              {
                key: 'locations',
                label: (
                  <span>
                    <EnvironmentOutlined />
                    Location Management
                  </span>
                ),
                children: <LocationManagement />
              }
            ]}
          />
        </Col>

        {/* Right Column - Analytics & Settings */}
        <Col xs={24} lg={10}>
          <Card title={<><BarChartOutlined /> Analytics Dashboard</>} style={{ marginBottom: '16px' }}>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <BarChartOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
              <Title level={4} type="secondary">Analytics Coming Soon</Title>
              <Paragraph type="secondary">
                Staff performance metrics, average hours, and weekly summaries will be available here.
              </Paragraph>
              <Button type="dashed" disabled>
                View Reports
              </Button>
            </div>
          </Card>

          <Card title={<><EnvironmentOutlined /> Geofencing Status</>}>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>✅ Location-Based Security Active</Text>
              </div>
              <Paragraph type="secondary" style={{ fontSize: '14px', marginBottom: '12px' }}>
                All clock-in attempts are now validated against location geofences. Care workers must be within the specified radius to clock in.
              </Paragraph>
              <div style={{ marginBottom: '8px' }}>
                <Tag color="green">Geofencing Enabled</Tag>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <Tag color="blue">GPS Validation</Tag>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <Tag color="orange">Manager Controls</Tag>
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Use the "Location Management" tab to adjust geofence radii for each workplace.
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Access Control Info */}
      <Divider />
      <Card size="small" style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
        <Space>
          <Text strong style={{ color: '#52c41a' }}>✅ RBAC Active:</Text>
          <Text>This page is restricted to MANAGER role users only.</Text>
          <Text type="secondary">
            Your role: <Tag color="gold">{user.role}</Tag>
          </Text>
        </Space>
      </Card>
    </div>
  );
}
