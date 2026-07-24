'use client';

import React from 'react';
import { QueryProvider } from './QueryProvider';
import { SyncProvider } from './SyncProvider';
import { AuthProvider } from './AuthProvider';

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <SyncProvider>
      <AuthProvider>
        <QueryProvider>
          {children}
        </QueryProvider>
      </AuthProvider>
    </SyncProvider>
  );
}
