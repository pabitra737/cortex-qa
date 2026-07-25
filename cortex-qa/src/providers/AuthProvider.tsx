'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { useSync } from './SyncProvider';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { getLocalCache, setLocalCache } = useSync();

  // Load user session on start (checking offline IndexedDB cache first)
  useEffect(() => {
    async function loadSession() {
      try {
        const cachedUser = await getLocalCache('current_user_profile');
        if (cachedUser) {
          setUser(cachedUser);
        }
        
        // Also fetch from API to verify/update if online
        if (navigator.onLine) {
          const res = await fetch('/api/auth/session');
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setUser(data.user);
              await setLocalCache('current_user_profile', data.user);
            } else {
              setUser(null);
              await setLocalCache('current_user_profile', null);
            }
          }
        }
      } catch (err) {
        console.error('Session load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        await setLocalCache('current_user_profile', data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      await setLocalCache('current_user_profile', null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'Super Admin') return true;
    return user.permissions.includes(permission) || user.permissions.includes('*');
  };

  const isRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, isRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
