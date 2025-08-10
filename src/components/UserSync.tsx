"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { useEffect, useState } from "react";

export default function UserSync() {
  const { user, isLoading } = useUser();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');

  useEffect(() => {
    // Only sync if we have a user and haven't synced yet
    if (user && syncStatus === 'idle') {
      syncUser();
    }
  }, [user, syncStatus]);

  const syncUser = async () => {
    setSyncStatus('syncing');
    setSyncMessage('Syncing user data...');

    try {
      const response = await fetch('/api/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSyncStatus('success');
        setSyncMessage(`User synced successfully: ${data.user.email}`);
        console.log('User sync successful:', data);
      } else {
        setSyncStatus('error');
        setSyncMessage(`Sync failed: ${data.error}`);
        console.error('User sync failed:', data);
      }
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage('Sync failed: Network error');
      console.error('User sync error:', error);
    }
  };

  // Don't render anything if no user or still loading
  if (isLoading || !user) {
    return null;
  }

  // Show sync status (optional - you can make this invisible)
  return (
    <div className="p-2.5 text-xs text-gray-600">
      Status: {syncMessage}
      {syncStatus === 'error' && (
        <button 
          onClick={syncUser} 
          className="ml-2.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
        >
          Retry Sync
        </button>
      )}
    </div>
  );
}
