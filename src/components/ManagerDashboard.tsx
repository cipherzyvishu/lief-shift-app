'use client';

import React from 'react';
import { Card, Typography, Space, Button, Tag, Divider, Row, Col } from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  SettingOutlined,
  TeamOutlined,
  BarChartOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

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
          <Card title={<><TeamOutlined /> Current Staff Status</>} style={{ marginBottom: '16px' }}>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <TeamOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
              <Title level={4} type="secondary">Staff Monitoring Coming Soon</Title>
              <Paragraph type="secondary">
                Real-time staff clock-in/out status and location tracking will be available here.
              </Paragraph>
              <Button type="dashed" disabled>
                View All Staff
              </Button>
            </div>
          </Card>

          <Card title={<><ClockCircleOutlined /> Recent Shift Activity</>}>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <ClockCircleOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
              <Title level={4} type="secondary">Shift History Coming Soon</Title>
              <Paragraph type="secondary">
                Detailed clock-in/out history with timestamps and locations will be displayed here.
              </Paragraph>
              <Button type="dashed" disabled>
                View Shift History
              </Button>
            </div>
          </Card>
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

          <Card title={<><EnvironmentOutlined /> Location Management</>}>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <EnvironmentOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
              <Title level={4} type="secondary">Geofencing Coming Soon</Title>
              <Paragraph type="secondary">
                Set up location perimeters and manage clock-in boundaries for different sites.
              </Paragraph>
              <Button type="dashed" disabled>
                Manage Locations
              </Button>
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
