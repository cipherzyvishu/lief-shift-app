'use client';

import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Alert, Spin, Tag, Button } from 'antd';
import { ReloadOutlined, HistoryOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';

const { Title } = Typography;

// Define interfaces for type safety
interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Shift {
  id: string;
  clockInTime: string;
  clockOutTime: string | null;
  status: string;
  totalHours: number | null;
  clockInNote: string | null;
  clockOutNote: string | null;
  user: User;
  location: Location;
}

interface ShiftConnection {
  shifts: Shift[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ShiftHistoryTableProps {
  className?: string;
}

const ShiftHistoryTable: React.FC<ShiftHistoryTableProps> = ({ className }) => {
  const [data, setData] = useState<ShiftConnection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const fetchShiftHistory = async (page: number = 1, size: number = 10) => {
    setLoading(true);
    setError(null);

    try {
      const skip = (page - 1) * size;
      
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query AllShifts($skip: Int, $take: Int) {
              allShifts(skip: $skip, take: $take) {
                shifts {
                  id
                  clockInTime
                  clockOutTime
                  status
                  totalHours
                  clockInNote
                  clockOutNote
                  user {
                    id
                    email
                    name
                    role
                  }
                  location {
                    name
                    latitude
                    longitude
                  }
                }
                totalCount
                hasNextPage
                hasPreviousPage
              }
            }
          `,
          variables: {
            skip,
            take: size
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'GraphQL query failed');
      }

      if (result.data?.allShifts) {
        setData(result.data.allShifts);
        console.log(`📊 Loaded ${result.data.allShifts.shifts.length} shifts from history`);
      } else {
        throw new Error('No shift history data received');
      }

    } catch (err) {
      console.error('❌ Error fetching shift history:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch shift history';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when pagination changes
  useEffect(() => {
    fetchShiftHistory(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Handle pagination change
  const handleTableChange = (pagination: TablePaginationConfig) => {
    if (pagination.current && pagination.pageSize) {
      setCurrentPage(pagination.current);
      setPageSize(pagination.pageSize);
    }
  };

  // Format time display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate hours worked
  const formatHours = (hours: number | null) => {
    if (hours === null || hours === undefined) return '-';
    return `${hours.toFixed(1)}h`;
  };

  // Define table columns
  const columns: ColumnsType<Shift> = [
    {
      title: 'Staff Member',
      key: 'staff',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.user.name || record.user.email}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <Tag color={record.user.role === 'MANAGER' ? 'gold' : 'blue'}>
              {record.user.role.replace('_', ' ')}
            </Tag>
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: 'Location',
      dataIndex: ['location', 'name'],
      key: 'location',
      width: 150,
    },
    {
      title: 'Clock In',
      dataIndex: 'clockInTime',
      key: 'clockInTime',
      render: (time: string) => formatDateTime(time),
      width: 150,
    },
    {
      title: 'Clock Out',
      dataIndex: 'clockOutTime',
      key: 'clockOutTime',
      render: (time: string | null) => time ? formatDateTime(time) : '-',
      width: 150,
    },
    {
      title: 'Total Hours',
      dataIndex: 'totalHours',
      key: 'totalHours',
      render: formatHours,
      width: 100,
      sorter: (a, b) => (a.totalHours || 0) - (b.totalHours || 0),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'CLOCKED_OUT' ? 'green' : 'orange'}>
          {status.replace('_', ' ')}
        </Tag>
      ),
      width: 120,
      filters: [
        { text: 'Clocked In', value: 'CLOCKED_IN' },
        { text: 'Clocked Out', value: 'CLOCKED_OUT' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Notes',
      key: 'notes',
      render: (_, record) => {
        const notes = [];
        if (record.clockInNote) notes.push(`In: ${record.clockInNote}`);
        if (record.clockOutNote) notes.push(`Out: ${record.clockOutNote}`);
        return notes.length > 0 ? (
          <div style={{ fontSize: '12px', maxWidth: '200px' }}>
            {notes.map((note, idx) => (
              <div key={idx}>{note}</div>
            ))}
          </div>
        ) : '-';
      },
      width: 200,
    },
  ];

  // Configure pagination
  const paginationConfig: TablePaginationConfig = {
    current: currentPage,
    pageSize: pageSize,
    total: data?.totalCount || 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} shifts`,
    pageSizeOptions: ['10', '20', '50', '100'],
    onChange: (page, size) => {
      setCurrentPage(page);
      if (size !== pageSize) {
        setPageSize(size);
        setCurrentPage(1); // Reset to first page when changing page size
      }
    },
  };

  if (loading) {
    return (
      <Card className={className}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            Loading shift history...
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <Alert
          message="Error Loading Shift History"
          description={error}
          type="error"
          showIcon
          action={
            <Button
              size="small"
              type="primary"
              onClick={() => fetchShiftHistory(currentPage, pageSize)}
            >
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card 
      className={className}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <HistoryOutlined style={{ marginRight: '8px' }} />
            <Title level={4} style={{ margin: 0 }}>
              Shift History
            </Title>
          </div>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={() => fetchShiftHistory(currentPage, pageSize)}
            title="Refresh Data"
          />
        </div>
      }
    >
      <Table
        dataSource={data?.shifts || []}
        columns={columns}
        rowKey="id"
        pagination={paginationConfig}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
        size="middle"
      />
    </Card>
  );
};

export default ShiftHistoryTable;
