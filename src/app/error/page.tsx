'use client';

import React from 'react';
import { Card, Button, Alert, Typography, Space } from 'antd';
import { ReloadOutlined, LoginOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function ErrorPage() {
  const handleRetry = () => {
    // Clear browser storage and redirect
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      
      window.location.href = '/api/auth/login';
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card style={{ maxWidth: '500px', textAlign: 'center' }}>
        <Title level={2} type="danger">Authentication Error</Title>
        
        <Alert
          message="Session Error"
          description="There was a problem with your authentication session. This is usually caused by expired or corrupted session data."
          type="error"
          style={{ marginBottom: '24px' }}
        />
        
        <Paragraph>
          This error commonly occurs when:
        </Paragraph>
        <ul style={{ textAlign: 'left', marginBottom: '24px' }}>
          <li>Your session has expired</li>
          <li>Browser cookies are corrupted</li>
          <li>The app was updated while you were logged in</li>
        </ul>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            type="primary" 
            icon={<LoginOutlined />}
            onClick={handleRetry}
            size="large"
          >
            Clear Session & Login Again
          </Button>
          
          <Button 
            icon={<ReloadOutlined />}
            onClick={handleGoHome}
          >
            Try Homepage
          </Button>
        </Space>
      </Card>
    </div>
  );
}
