'use client';

import React, { useState } from 'react';
import { Card, Button, Typography, Alert, Space, Tag, Spin } from 'antd';
import { 
  SafetyOutlined,
  UserOutlined,
  ExperimentOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function RBACTester() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const runRBACTests = async () => {
    setTesting(true);
    const results = [];

    // Test 1: Access Manager Dashboard
    try {
      const response = await fetch('/dashboard/manager', {
        method: 'GET',
        credentials: 'include'
      });

      results.push({
        test: 'Manager Dashboard Access',
        status: response.status,
        result: response.status === 200 ? 'ALLOWED' : 'DENIED',
        details: `HTTP ${response.status} - ${response.status === 200 ? 'Access granted' : 'Access denied or redirected'}`
      });
    } catch (error) {
      results.push({
        test: 'Manager Dashboard Access',
        status: 'ERROR',
        result: 'ERROR',
        details: 'Network error or redirect occurred'
      });
    }

    // Test 2: Check current user role
    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        results.push({
          test: 'Current User Role',
          status: 200,
          result: data.role || 'UNKNOWN',
          details: `User role: ${data.role}, Email: ${data.email}`
        });
      } else {
        results.push({
          test: 'Current User Role',
          status: response.status,
          result: 'ERROR',
          details: 'Could not fetch user profile'
        });
      }
    } catch (error) {
      results.push({
        test: 'Current User Role',
        status: 'ERROR',
        result: 'ERROR',
        details: 'API endpoint may not exist yet'
      });
    }

    setTestResults(results);
    setTesting(false);
  };

  return (
    <Card style={{ maxWidth: '800px', margin: '20px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <SafetyOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
        <Title level={3}>RBAC Testing Suite</Title>
        <Paragraph type="secondary">
          Test Role-Based Access Control functionality
        </Paragraph>
      </div>

      <Alert
        message="RBAC Implementation Status"
        description={
          <Space direction="vertical" size="small">
            <Text>✅ <strong>Manager Dashboard Route:</strong> /dashboard/manager</Text>
            <Text>✅ <strong>Role Validation:</strong> Server-side session + database check</Text>
            <Text>✅ <strong>Access Control:</strong> Automatic redirect for non-MANAGER users</Text>
            <Text>✅ <strong>Navigation:</strong> Role-based UI elements</Text>
          </Space>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: '24px' }}
      />

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Button
          type="primary"
          icon={<ExperimentOutlined />}
          size="large"
          onClick={runRBACTests}
          loading={testing}
        >
          {testing ? 'Running Tests...' : 'Test RBAC System'}
        </Button>
      </div>

      {testResults.length > 0 && (
        <div>
          <Title level={4}>Test Results:</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            {testResults.map((result, index) => (
              <Card key={index} size="small">
                <Space>
                  <Tag color={
                    result.result === 'ALLOWED' ? 'green' :
                    result.result === 'DENIED' ? 'orange' :
                    result.result === 'MANAGER' ? 'gold' :
                    result.result === 'CARE_WORKER' ? 'blue' : 'red'
                  }>
                    {result.result}
                  </Tag>
                  <Text strong>{result.test}</Text>
                </Space>
                <div style={{ marginTop: '8px' }}>
                  <Text type="secondary">{result.details}</Text>
                </div>
              </Card>
            ))}
          </Space>
        </div>
      )}

      <Alert
        message="How to Test RBAC Manually"
        description={
          <Space direction="vertical" size="small">
            <Text>🔹 <strong>As MANAGER:</strong> Click "Manager Dashboard" button - should work</Text>
            <Text>🔹 <strong>As CARE_WORKER:</strong> Try accessing /dashboard/manager - should redirect to home</Text>
            <Text>🔹 <strong>Not logged in:</strong> Try accessing /dashboard/manager - should redirect to login</Text>
            <Text>🔹 <strong>Change roles:</strong> Use Prisma Studio to change user roles and test</Text>
          </Space>
        }
        type="warning"
        style={{ marginTop: '24px' }}
      />
    </Card>
  );
}
