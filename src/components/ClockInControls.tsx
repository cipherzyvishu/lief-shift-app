"use client";

import React, { useState } from 'react';
import { Card, Button, Input, Typography, Space, Alert, Spin } from 'antd';
import { useShift } from '@/context/ShiftContext';

const { TextArea } = Input;
const { Text } = Typography;

export default function ClockInControls() {
  const { 
    isClockedIn, 
    loading, 
    error, 
    isGeofenceError, 
    geofenceDetails, 
    activeShift, 
    handleClockIn, 
    handleClockOut,
    clearError 
  } = useShift();
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
        {/* Error Display - Enhanced for Geofence Errors */}
        {error && (
          <Alert
            message={isGeofenceError ? "Location Verification Failed" : "Error"}
            description={
              isGeofenceError && geofenceDetails ? (
                <div>
                  <div style={{ marginBottom: '8px' }}>{error}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    <strong>Distance from {geofenceDetails.locationName}:</strong> {Math.round(geofenceDetails.distance)}m<br />
                    <strong>Maximum allowed distance:</strong> {geofenceDetails.maxDistance}m<br />
                    <strong>You need to be:</strong> {Math.round(geofenceDetails.distance - geofenceDetails.maxDistance)}m closer
                  </div>
                </div>
              ) : (
                error
              )
            }
            type={isGeofenceError ? "warning" : "error"}
            showIcon
            closable
            onClose={clearError}
            action={
              isGeofenceError ? (
                <Button size="small" type="text" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              ) : null
            }
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
