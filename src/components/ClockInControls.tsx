"use client";

import React, { useState } from 'react';
import { Card, Button, Input, Typography, Space, Alert, Spin } from 'antd';
import { useShift } from '@/context/ShiftContext';

const { TextArea } = Input;
const { Text } = Typography;

export default function ClockInControls() {
  const { isClockedIn, loading, error, activeShift, handleClockIn, handleClockOut } = useShift();
  const [notes, setNotes] = useState<string>('');

  // Handle clock in button click
  const onClockIn = async () => {
    console.log('Clock In button clicked');
    await handleClockIn(notes);
    setNotes(''); // Clear notes after clock in
  };

  // Handle clock out button click
  const onClockOut = async () => {
    console.log('Clock Out button clicked with notes:', notes);
    await handleClockOut(notes);
    setNotes(''); // Clear notes after clock out
  };

  return (
    <Card
      title="Shift Management"
      style={{ maxWidth: 400, margin: '20px auto' }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Error Display */}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
          />
        )}

        {/* Active Shift Info */}
        {activeShift && (
          <div style={{ 
            background: '#f6ffed', 
            border: '1px solid #b7eb8f',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '12px'
          }}>
            <Text strong style={{ color: '#52c41a' }}>
              ✓ Clocked In at {activeShift.location?.name}
            </Text>
            <br />
            <Text type="secondary">
              Since: {new Date(activeShift.clockInTime).toLocaleString()}
            </Text>
          </div>
        )}

        {!isClockedIn ? (
          // Clock In State
          <>
            <TextArea
              rows={3}
              placeholder="Add notes about starting your shift (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
            
            <Button
              type="primary"
              size="large"
              block
              onClick={onClockIn}
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Clocking In...' : 'Clock In'}
            </Button>
          </>
        ) : (
          // Clocked In State
          <>            
            <TextArea
              rows={4}
              placeholder="Add notes about your shift before clocking out..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
            
            <Button
              type="default"
              size="large"
              block
              onClick={onClockOut}
              loading={loading}
              disabled={loading}
              danger
            >
              {loading ? 'Clocking Out...' : 'Clock Out'}
            </Button>
          </>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div style={{ textAlign: 'center' }}>
            <Spin />
            <br />
            <Text type="secondary">
              {isClockedIn ? 'Processing clock out...' : 'Processing clock in...'}
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );
}
