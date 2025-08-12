"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define types for better type safety
interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

interface ActiveShift {
  id: string;
  clockInTime: string;
  clockInNote?: string;
  status: string;
  location: Location;
}

// Define the context state interface
interface ShiftContextState {
  isClockedIn: boolean;
  loading: boolean;
  error: string | null;
  activeShift: ActiveShift | null;
  handleClockIn: (notes?: string) => Promise<void>;
  handleClockOut: (notes?: string) => Promise<void>;
  checkActiveShift: () => Promise<void>;
}

// Create the context
const ShiftContext = createContext<ShiftContextState | undefined>(undefined);

// ShiftProvider component props interface
interface ShiftProviderProps {
  children: ReactNode;
}

// ShiftProvider component that manages the state
export const ShiftProvider: React.FC<ShiftProviderProps> = ({ children }) => {
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);

  // Function to get user's location
  const getUserLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          console.warn('Location access denied, using default location');
          // Use default location if user denies location access
          resolve({ latitude: 0, longitude: 0 });
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    });
  };

  // Function to check for active shift via GraphQL
  const checkActiveShift = async () => {
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
                status
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

      const result = await response.json();
      
      if (result.data?.myActiveShift) {
        setActiveShift(result.data.myActiveShift);
        setIsClockedIn(true);
      } else {
        setActiveShift(null);
        setIsClockedIn(false);
      }
    } catch (error) {
      console.error('Error checking active shift:', error);
    }
  };

  // Check for active shift on component mount
  useEffect(() => {
    checkActiveShift();
  }, []);

  // Function to handle clocking in
  const handleClockIn = async (notes?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Get user's location
      const location = await getUserLocation();

      const response = await fetch('/api/clock-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes,
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsClockedIn(true);
        setActiveShift(result.shift);
        console.log('✅ Successfully clocked in:', result.shift);
      } else {
        setError(result.error || 'Failed to clock in');
        console.error('❌ Clock-in failed:', result.error);
      }
    } catch (error: unknown) {
      setError('Network error during clock-in');
      console.error('❌ Clock-in network error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle clocking out
  const handleClockOut = async (notes?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Get user's location
      const location = await getUserLocation();

      const response = await fetch('/api/clock-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes,
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsClockedIn(false);
        setActiveShift(null);
        console.log('✅ Successfully clocked out:', result.shift);
      } else {
        setError(result.error || 'Failed to clock out');
        console.error('❌ Clock-out failed:', result.error);
      }
    } catch (error: unknown) {
      setError('Network error during clock-out');
      console.error('❌ Clock-out network error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Context value object
  const contextValue: ShiftContextState = {
    isClockedIn,
    loading,
    error,
    activeShift,
    handleClockIn,
    handleClockOut,
    checkActiveShift,
  };

  return (
    <ShiftContext.Provider value={contextValue}>
      {children}
    </ShiftContext.Provider>
  );
};

// Custom hook for easy consumption of the context
export const useShift = (): ShiftContextState => {
  const context = useContext(ShiftContext);
  
  if (context === undefined) {
    throw new Error('useShift must be used within a ShiftProvider');
  }
  
  return context;
};
