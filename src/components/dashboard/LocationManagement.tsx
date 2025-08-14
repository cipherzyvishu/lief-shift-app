'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Form, InputNumber, Button, Alert, message, Typography, Tag, Space } from 'antd';
import { EnvironmentOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  createdAt: string;
  updatedAt: string;
}

interface LocationManagementProps {
  className?: string;
}

const LocationManagement: React.FC<LocationManagementProps> = ({ className }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Fetch all locations
  const fetchLocations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query AllLocations {
              allLocations {
                id
                name
                latitude
                longitude
                radius
                createdAt
                updatedAt
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'GraphQL query failed');
      }

      if (result.data?.allLocations) {
        setLocations(result.data.allLocations);
        console.log(`📍 Loaded ${result.data.allLocations.length} locations`);
      } else {
        throw new Error('No location data received');
      }

    } catch (err) {
      console.error('❌ Error fetching locations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch locations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update location radius
  const updateLocationRadius = async (locationId: string, newRadius: number) => {
    setUpdating(locationId);

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation UpdateLocation($locationId: ID!, $radius: Int!) {
              updateLocation(locationId: $locationId, radius: $radius) {
                id
                name
                latitude
                longitude
                radius
                updatedAt
              }
            }
          `,
          variables: {
            locationId,
            radius: Math.round(newRadius)
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'GraphQL mutation failed');
      }

      if (result.data?.updateLocation) {
        // Update the location in state
        setLocations(prevLocations => 
          prevLocations.map(loc => 
            loc.id === locationId 
              ? { ...loc, radius: result.data.updateLocation.radius, updatedAt: result.data.updateLocation.updatedAt }
              : loc
          )
        );
        
        message.success(`Updated geofence radius for ${result.data.updateLocation.name}`);
        console.log(`✅ Updated location ${locationId} radius to ${newRadius}m`);
      } else {
        throw new Error('No update data received');
      }

    } catch (err) {
      console.error('❌ Error updating location:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update location';
      message.error(errorMessage);
    } finally {
      setUpdating(null);
    }
  };

  // Format distance for display
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  };

  // Handle form submission for radius update
  const handleRadiusUpdate = (locationId: string, values: { radius: number }) => {
    updateLocationRadius(locationId, values.radius);
  };

  // Define table columns
  const columns: ColumnsType<Location> = [
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            <EnvironmentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            {record.name}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <Text type="secondary">
              {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
            </Text>
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: 'Current Radius',
      dataIndex: 'radius',
      key: 'currentRadius',
      render: (radius: number) => (
        <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
          {formatDistance(radius)}
        </Tag>
      ),
      width: 120,
    },
    {
      title: 'Update Radius',
      key: 'updateRadius',
      render: (_, record) => (
        <Form
          form={form}
          onFinish={(values) => handleRadiusUpdate(record.id, values)}
          layout="inline"
        >
          <Form.Item
            name={`radius_${record.id}`}
            initialValue={record.radius}
            rules={[
              { required: true, message: 'Radius is required' },
              { type: 'number', min: 10, max: 10000, message: 'Radius must be between 10 and 10,000 meters' }
            ]}
          >
            <InputNumber
              placeholder="Radius (m)"
              style={{ width: '120px' }}
              min={10}
              max={10000}
              disabled={updating === record.id}
            />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={updating === record.id}
              size="small"
            >
              Update
            </Button>
          </Form.Item>
        </Form>
      ),
      width: 250,
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt: string) => {
        const date = new Date(updatedAt);
        return (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {date.toLocaleDateString()}<br />
            {date.toLocaleTimeString()}
          </Text>
        );
      },
      width: 120,
    },
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  if (error) {
    return (
      <Card className={className}>
        <Alert
          message="Error Loading Locations"
          description={error}
          type="error"
          showIcon
          action={
            <Button
              size="small"
              type="primary"
              onClick={fetchLocations}
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
            <EnvironmentOutlined style={{ marginRight: '8px' }} />
            <Title level={4} style={{ margin: 0 }}>
              Location Management
            </Title>
          </div>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={fetchLocations}
            loading={loading}
            title="Refresh Data"
          />
        </div>
      }
    >
      <div style={{ marginBottom: '16px' }}>
        <Alert
          message="Geofencing Controls"
          description="Set the radius for each location to control how close care workers must be to clock in. Radius is measured in meters from the location's GPS coordinates."
          type="info"
          showIcon
        />
      </div>

      <Table
        dataSource={locations}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="middle"
        scroll={{ x: 700 }}
      />

      <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
        <Space split="•">
          <span>📍 {locations.length} locations configured</span>
          <span>⚡ Changes take effect immediately</span>
          <span>🔒 Manager access only</span>
        </Space>
      </div>
    </Card>
  );
};

export default LocationManagement;
