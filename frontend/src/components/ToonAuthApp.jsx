'use client';

import React, { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import AuthPage from '@/components/AuthPage';
import VipDashboard from '@/components/VipDashboard';

export default function ToonAuthApp() {
  const [authenticatedUser, setAuthenticatedUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cp_hero_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.id || parsed.access_token)) {
            return parsed;
          }
        }
      } catch (err) {
        console.error('Failed to load user session from localStorage', err);
      }
    }
    return null;
  });

  const [currentScreen, setCurrentScreen] = useState('landing');

  const saveUserSession = (userData) => {
    setAuthenticatedUser(userData);
    if (userData) {
      localStorage.setItem('cp_hero_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('cp_hero_user');
    }
  };

  if (authenticatedUser) {
    return (
      <VipDashboard
        user={authenticatedUser}
        onLogout={() => {
          saveUserSession(null);
          setCurrentScreen('landing');
        }}
        onUserUpdate={(updatedUser) => {
          saveUserSession(updatedUser);
        }}
      />
    );
  }

  if (currentScreen === 'auth') {
    return (
      <AuthPage
        onLoginSuccess={(userData) => {
          saveUserSession(userData);
        }}
      />
    );
  }

  return (
    <LandingPage
      onGoToAuth={() => setCurrentScreen('auth')}
    />
  );
}
