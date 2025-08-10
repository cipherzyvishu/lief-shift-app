// src/components/UserProfile.tsx
'use client' // This component needs to run in the browser to access the user hook

import { useUser } from '@auth0/nextjs-auth0';
import React from 'react';

export default function UserProfile() {
  const { user, error, isLoading } = useUser();

  // Show a loading message while the SDK is fetching the user's session
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Show an error message if something went wrong
  if (error) {
    return <div>{error.message}</div>;
  }

  // If `user` exists, the user is logged in
  if (user) {
    return (
      <div>
        <h2>Welcome, {user.name}!</h2>
        <p>Your email is: {user.email}</p>
        {/* The SDK automatically created this logout route for us */}
        <a href="/api/auth/logout">Log Out</a>
      </div>
    );
  }

  // If `user` does not exist, the user is not logged in
  return (
    <div>
      <p>You are not logged in.</p>
      {/* These routes were also created by the SDK */}
      <a href="/api/auth/login">Log In</a>
      <br />
      <a href="/api/auth/login?screen_hint=signup">Sign Up</a>
    </div>
  );
}