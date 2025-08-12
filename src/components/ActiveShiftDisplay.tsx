'use client';

import { useEffect, useState } from 'react';
import { Card, Spin, Typography, Alert, Button } from 'antd';
import { useShift } from '@/context/ShiftContext';

const { Title, Text } = Typography;

interface Shift {
  id: string;
  clockInTime: string;
  clockInNote?: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
}

interface ApiResponse {
  data?: {
    myActiveShift: Shift | null;
  };
  errors?: Array<{ message: string }>;
}

export default function ActiveShiftDisplay() {
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isClockedIn, checkActiveShift } = useShift();

  const fetchActiveShift = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query MyActiveShift {
              myActiveShift {
                id
                clockInTime
                clockInNote
                location {
                  name
                  latitude
                  longitude
                }
              }
            }
          `,
        }),
      });

      const result: ApiResponse = await response.json();

      if (result.errors) {
        setError(result.errors[0]?.message || 'An error occurred');
      } else {
        setActiveShift(result.data?.myActiveShift || null);
        setError(null);
      }
    } catch {
      setError('Failed to fetch active shift');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when clock-in status changes
  useEffect(() => {
    fetchActiveShift();
  }, [isClockedIn]); // Re-fetch when clock-in status changes

  const handleRefresh = () => {
    fetchActiveShift();
    checkActiveShift(); // Also update the context
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '12px' }}>
            <Text type="secondary">Loading your active shift...</Text>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Shift"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!activeShift) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Title level={4}>No Active Shift</Title>
          <Text type="secondary">You are not currently clocked in.</Text>
          <div style={{ marginTop: '12px' }}>
            <Button type="link" onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Your Active Shift" 
      style={{ marginBottom: '16px' }}
      extra={
        <Button type="link" onClick={handleRefresh} size="small">
          Refresh
        </Button>
      }
    >
      <div>
        <Text strong>Location: </Text>
        <Text>{activeShift.location.name}</Text>
      </div>
      <div style={{ marginTop: '8px' }}>
        <Text strong>Coordinates: </Text>
        <Text>{activeShift.location.latitude.toFixed(4)}, {activeShift.location.longitude.toFixed(4)}</Text>
      </div>
      <div style={{ marginTop: '8px' }}>
        <Text strong>Clocked In: </Text>
        <Text>{new Date(activeShift.clockInTime).toLocaleString()}</Text>
      </div>
      {activeShift.clockInNote && (
        <div style={{ marginTop: '8px' }}>
          <Text strong>Notes: </Text>
          <Text>{activeShift.clockInNote}</Text>
        </div>
      )}
    </Card>
  );
}
