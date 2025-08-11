'use client';

import React from 'react';
import { Card, Button, Space, Typography, Tag } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  SettingOutlined,
  LogoutOutlined 
} from '@ant-design/icons';
import Link from 'next/link';

const { Text } = Typography;

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface NavigationProps {
  user: User | null;
}

export default function Navigation({ user }: NavigationProps) {
  if (!user) return null;

  return (
    <Card size="small" style={{ marginBottom: '16px' }}>
      <Space wrap>
        <div>
          <Text strong>{user.name || user.email}</Text>
          <Tag color={user.role === 'MANAGER' ? 'gold' : 'blue'} style={{ marginLeft: '8px' }}>
            {user.role}
          </Tag>
        </div>
        
        <div style={{ marginLeft: 'auto' }}>
          <Space>
            {user.role === 'MANAGER' && (
              <Link href="/dashboard/manager">
                <Button type="primary" icon={<DashboardOutlined />} size="small">
                  Manager Dashboard
                </Button>
              </Link>
            )}
            
            <Link href="/profile">
              <Button icon={<UserOutlined />} size="small">
                Profile
              </Button>
            </Link>
            
            <Link href="/auth/logout">
              <Button icon={<LogoutOutlined />} size="small">
                Logout
              </Button>
            </Link>
          </Space>
        </div>
      </Space>
    </Card>
  );
}
