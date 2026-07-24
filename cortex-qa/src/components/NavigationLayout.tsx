'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useSync } from '@/providers/SyncProvider';
import { 
  ClipboardCheck, 
  Folder, 
  Settings, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  LogOut, 
  Menu, 
  X,
  Factory,
  DatabaseZap,
  Users,
  BarChart3,
  User
} from 'lucide-react';

export default function NavigationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [tab, setTab] = useState<string | null>(null);
  const { user, logout, hasPermission } = useAuth();
  const { isOnline, isSyncing, queueLength, triggerSync } = useSync();
  const [virMode, setVirMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setTab(params.get('tab'));
    }
  }, [pathname]);

  // Initialize VIR Mode from HTML element classes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isVir = document.documentElement.classList.contains('vir-mode');
      setVirMode(isVir);
    }
  }, []);

  const toggleVirMode = () => {
    if (typeof window === 'undefined') return;
    const current = !virMode;
    setVirMode(current);
    if (current) {
      document.documentElement.classList.add('vir-mode');
      localStorage.setItem('cortex_theme', 'vir');
    } else {
      document.documentElement.classList.remove('vir-mode');
      localStorage.setItem('cortex_theme', 'light');
    }
  };

  const navItems = [
    { name: 'Projects', path: '/projects', icon: Folder, permission: 'read:all' },
    { name: 'Tasks', path: '/tasks', icon: ClipboardCheck, permission: 'read:all' },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3, permission: 'read:all' },
    { name: 'Users', path: '/users', icon: Users, permission: 'read:all' },
  ];

  // Admin items
  if (user?.role === 'Super Admin' || user?.role === 'Factory Admin') {
    navItems.push({ name: 'Factories', path: '/factories', icon: Factory, permission: 'manage:projects' });
  }
  
  // Profile settings / diagnostics
  navItems.push({ name: 'Profile', path: '/profile', icon: User, permission: 'read:all' });

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-base text-text-base pb-20">
      
      {/* 1. TOP HEADER BAR */}
      <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border-custom bg-bg-surface sticky top-0 z-30 shadow-sm">
        {/* Left Side: Brand Logo & Factory info */}
        <div className="flex items-center space-x-3">
          <span className="font-extrabold text-xl tracking-tight text-primary">CORTEX<span className="text-text-base">-QA</span></span>
          {user && (
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] bg-primary/20 text-primary-dark rounded font-semibold uppercase">
              {user.factoryId === 'all' ? 'All Factories' : `Factory: ${user.factoryId}`}
            </span>
          )}
        </div>

        {/* Right Side: Network status, Sync, Theme, User Profile & Logout */}
        <div className="flex items-center space-x-3">
          {/* Sync Queue Badge */}
          {queueLength > 0 && (
            <button 
              onClick={triggerSync}
              disabled={isSyncing || !isOnline}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-500 text-white rounded-full text-xs font-bold animate-pulse cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{queueLength} offline</span>
              <span className="sm:hidden">{queueLength}</span>
            </button>
          )}

          {/* Connection Status Indicator */}
          <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
            {isOnline ? (
              <>
                <Wifi className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 mr-1" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* High-Contrast Switcher */}
          <button 
            onClick={toggleVirMode}
            className="px-3 py-1 border border-border-custom bg-bg-surface hover:bg-accent/5 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            {virMode ? 'Light' : 'VIR'}
          </button>

          {/* User Profile & Sign Out (Desktop/Tablet) */}
          {user && (
            <div className="hidden md:flex items-center space-x-3 pl-2 border-l border-border-custom">
              <div className="text-right">
                <div className="text-xs font-bold text-text-base">{user.name}</div>
                <div className="text-[10px] text-text-muted">{user.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Sign Out (Mobile) */}
          <button
            onClick={handleLogout}
            className="md:hidden p-2 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:py-10">
        {children}
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-16 bg-bg-surface border-t border-border-custom z-30 px-2 shadow-lg flex justify-center">
        <div className="w-full max-w-lg flex items-center justify-around h-full">
          {navItems.map((item) => {
            const isActive = pathname ? pathname.startsWith(item.path) : false;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex flex-col items-center justify-center flex-1 min-w-0 max-w-[80px] h-full text-[10px] font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-text-muted hover:text-text-base'
                }`}
              >
                <div className={`p-1.5 rounded-full ${isActive ? 'bg-primary/10' : ''}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="mt-0.5 font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}


