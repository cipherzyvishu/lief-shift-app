'use client';

import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert, Typography, Card, Tag, Space } from 'antd';
import { UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface ActiveShift {
  id: string;
  userId: string;
  locationId: string;
  clockInTime: string;
  clockInLat: number;
  clockInLng: number;
  clockInNote: string | null;
  status: string;
  user: User;
  location: Location;
}

interface ActiveStaffTableState {
  shifts: ActiveShift[];
  loading: boolean;
  error: string | null;
}

const ACTIVE_SHIFTS_QUERY = `
  query GetActiveShifts {
    activeShifts {
      id
      userId
      locationId
      clockInTime
      clockInLat
      clockInLng
      clockInNote
      status
      user {
        id
        name
        email
        role
      }
      location {
        id
        name
        latitude
        longitude
        radius
      }
    }
  }
`;

export default function ActiveStaffTable() {
  const [state, setState] = useState<ActiveStaffTableState>({
    shifts: [],
    loading: true,
    error: null
  });

  const fetchActiveShifts = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: ACTIVE_SHIFTS_QUERY,
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'GraphQL query failed');
      }

      setState({
        shifts: result.data.activeShifts || [],
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching active shifts:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch active shifts'
      }));
    }
  };

  useEffect(() => {
    fetchActiveShifts();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchActiveShifts, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatClockInTime = (clockInTime: string) => {
    const date = new Date(clockInTime);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} mins ago`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      const mins = diffInMinutes % 60;
      return `${hours}h ${mins}m ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const columns: ColumnsType<ActiveShift> = [
    {
      title: 'Staff Member',
      dataIndex: ['user', 'name'],
      key: 'staffName',
      render: (name: string | null, record: ActiveShift) => (
        <Space>
          <UserOutlined />
          <div>
            <div style={{ fontWeight: 600 }}>
              {name || 'No Name'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.user.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Location',
      dataIndex: ['location', 'name'],
      key: 'location',
      render: (locationName: string) => (
        <Tag color="blue">{locationName}</Tag>
      ),
    },
    {
      title: 'Clock-In Time',
      dataIndex: 'clockInTime',
      key: 'clockInTime',
      render: (clockInTime: string) => (
        <Space>
          <ClockCircleOutlined />
          <div>
            <div>{formatClockInTime(clockInTime)}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {new Date(clockInTime).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </Space>
      ),
      sorter: (a: ActiveShift, b: ActiveShift) => 
        new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime(),
    },
    {
      title: 'Clock-In Note',
      dataIndex: 'clockInNote',
      key: 'clockInNote',
      render: (note: string | null) => (
        note ? (
          <div style={{ 
            maxWidth: '200px', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {note}
          </div>
        ) : (
          <span style={{ color: '#999', fontStyle: 'italic' }}>No note</span>
        )
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: () => (
        <Tag color="green">ACTIVE</Tag>
      ),
    }
  ];

  if (state.error) {
    return (
      <Card>
        <Alert
          message="Error Loading Active Staff"
          description={state.error}
          type="error"
          showIcon
          action={
            <button 
              onClick={fetchActiveShifts}
              style={{ 
                background: 'none', 
                border: '1px solid #d9d9d9', 
                padding: '4px 8px',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              Retry
            </button>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>
          Active Staff ({state.shifts.length})
        </Title>
        {state.loading && <Spin size="small" />}
      </div>
      
      <Table
        dataSource={state.shifts}
        columns={columns}
        rowKey="id"
        loading={state.loading}
        pagination={state.shifts.length > 10 ? { pageSize: 10 } : false}
        locale={{
          emptyText: state.loading ? 'Loading...' : 'No staff currently clocked in'
        }}
        scroll={{ x: 800 }}
      />
      
      <div style={{ 
        marginTop: '12px', 
        fontSize: '12px', 
        color: '#666', 
        textAlign: 'right' 
      }}>
        Auto-refreshes every 30 seconds
      </div>
    </Card>
  );
}
