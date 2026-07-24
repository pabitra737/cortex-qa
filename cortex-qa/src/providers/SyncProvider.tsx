'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { openDB, IDBPDatabase } from 'idb';
import { SyncLog } from '@/types';

interface SyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  queueLength: number;
  syncLogs: SyncLog[];
  addToMutationQueue: (action: string, url: string, payload: any) => Promise<void>;
  addToMediaQueue: (id: string, type: 'signature' | 'photo', base64Data: string, relatedMutationId: string) => Promise<void>;
  triggerSync: () => Promise<void>;
  clearLogs: () => Promise<void>;
  getLocalCache: (key: string) => Promise<any>;
  setLocalCache: (key: string, data: any) => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

const DB_NAME = 'cortex_qa_offline';
const DB_VERSION = 1;

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [queueLength, setQueueLength] = useState<number>(0);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [db, setDb] = useState<IDBPDatabase | null>(null);

  // Initialize IndexedDB
  useEffect(() => {
    async function setupDB() {
      try {
        const openedDb = await openDB(DB_NAME, DB_VERSION, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('cached_data')) {
              db.createObjectStore('cached_data', { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains('mutations_queue')) {
              db.createObjectStore('mutations_queue', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('media_queue')) {
              db.createObjectStore('media_queue', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('sync_logs')) {
              db.createObjectStore('sync_logs', { keyPath: 'id' });
            }
          },
        });
        setDb(openedDb);
        
        // Load initial queue length
        const mutations = await openedDb.getAll('mutations_queue');
        const media = await openedDb.getAll('media_queue');
        setQueueLength(mutations.length + media.length);

        // Load sync logs from db
        const logs = await openedDb.getAll('sync_logs');
        setSyncLogs(logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } catch (err) {
        console.error('Failed to initialize IndexedDB:', err);
      }
    }
    
    if (typeof window !== 'undefined') {
      setupDB();
      setIsOnline(navigator.onLine);
    }
  }, []);

  // Monitor network status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      addLog('upload', 'success', 'Network connection restored. Preparing sync.');
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      addLog('download', 'failed', 'Network connection lost. Offline mode active.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [db, queueLength]);

  const addLog = async (type: 'upload' | 'download' | 'conflict_resolved', status: 'success' | 'failed', details: string) => {
    const newLog: SyncLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      type,
      status,
      details,
    };

    setSyncLogs(prev => [newLog, ...prev]);

    if (db) {
      try {
        await db.put('sync_logs', newLog);
      } catch (err) {
        console.error('Failed to write log to IndexedDB:', err);
      }
    }
  };

  const clearLogs = async () => {
    setSyncLogs([]);
    if (db) {
      const tx = db.transaction('sync_logs', 'readwrite');
      await tx.store.clear();
      await tx.done;
    }
  };

  // Cache functions
  const getLocalCache = async (key: string) => {
    if (!db) return null;
    const res = await db.get('cached_data', key);
    return res ? res.data : null;
  };

  const setLocalCache = async (key: string, data: any) => {
    if (!db) return;
    await db.put('cached_data', { key, data, updatedAt: new Date().toISOString() });
  };

  // Queuing Operations
  const addToMutationQueue = async (action: string, url: string, payload: any) => {
    setQueueLength(prev => prev + 1);
    const details = `Queued mutation: ${action} on ${url}`;
    await addLog('upload', 'success', details);

    if (db) {
      await db.add('mutations_queue', {
        action,
        url,
        payload,
        timestamp: new Date().toISOString(),
      });
    }

    // Auto trigger sync if online
    if (isOnline) {
      triggerSync();
    }
  };

  const addToMediaQueue = async (id: string, type: 'signature' | 'photo', base64Data: string, relatedMutationId: string) => {
    setQueueLength(prev => prev + 1);
    await addLog('upload', 'success', `Queued media upload (${type}) for inspection.`);

    if (db) {
      await db.put('media_queue', {
        id,
        type,
        base64Data,
        relatedMutationId,
        timestamp: new Date().toISOString(),
      });
    }

    // Auto trigger sync if online
    if (isOnline) {
      triggerSync();
    }
  };

  // Sync flush logic
  const triggerSync = async () => {
    if (!db || isSyncing || !isOnline) return;

    const mutations = await db.getAll('mutations_queue');
    const mediaItems = await db.getAll('media_queue');

    if (mutations.length === 0 && mediaItems.length === 0) return;

    setIsSyncing(true);
    await addLog('upload', 'success', `Starting synchronization: ${mutations.length} mutations, ${mediaItems.length} media files.`);

    try {
      // 1. Process media items first
      const mediaMap = new Map<string, string>(); // temp-id -> cloudinary-url
      
      for (const media of mediaItems) {
        try {
          const res = await fetch('/api/media/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: media.type,
              file: media.base64Data,
            }),
          });
          
          if (!res.ok) throw new Error(`Media upload failed with status ${res.status}`);
          
          const data = await res.json();
          mediaMap.set(media.id, data.url);
          
          // Delete from IndexedDB
          await db.delete('media_queue', media.id);
          setQueueLength(prev => Math.max(0, prev - 1));
          await addLog('upload', 'success', `Uploaded offline ${media.type} asset successfully.`);
        } catch (err: any) {
          await addLog('upload', 'failed', `Failed to upload offline ${media.type}: ${err.message || err}`);
          throw err; // Stop sync cascade on error
        }
      }

      // 2. Process mutations
      for (const mut of mutations) {
        try {
          // If the mutation payload relies on a media item that we just uploaded, inject its URL
          let payload = { ...mut.payload };
          
          if (payload.tempSignatureId && mediaMap.has(payload.tempSignatureId)) {
            payload.signatureUrl = mediaMap.get(payload.tempSignatureId);
            delete payload.tempSignatureId;
          }
          
          // Re-map photo attachment ids to actual URLs
          if (payload.answers) {
            Object.keys(payload.answers).forEach(key => {
              const val = payload.answers[key];
              if (typeof val === 'string' && val.startsWith('temp_photo_') && mediaMap.has(val)) {
                payload.answers[key] = mediaMap.get(val);
              }
            });
          }

          // Send to sync API
          const res = await fetch(mut.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || `API error ${res.status}`);
          }

          // Delete mutation from IndexedDB
          await db.delete('mutations_queue', mut.id);
          setQueueLength(prev => Math.max(0, prev - 1));
          await addLog('upload', 'success', `Synced operation successfully: ${mut.action}`);
        } catch (err: any) {
          await addLog('upload', 'failed', `Failed to sync operation (${mut.action}): ${err.message || err}`);
          throw err;
        }
      }

      // 3. Complete and notify server
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs: [{
            type: 'upload',
            status: 'success',
            details: `Completed background sync of ${mutations.length} items.`,
          }]
        }),
      });

      await addLog('upload', 'success', 'All offline data successfully synchronized and uploaded.');
    } catch (err: any) {
      console.error('Sync failed:', err);
      await addLog('upload', 'failed', `Sync execution aborted: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
      // Double check queue length
      if (db) {
        const mutations = await db.getAll('mutations_queue');
        const media = await db.getAll('media_queue');
        setQueueLength(mutations.length + media.length);
      }
    }
  };

  return (
    <SyncContext.Provider
      value={{
        isOnline,
        isSyncing,
        queueLength,
        syncLogs,
        addToMutationQueue,
        addToMediaQueue,
        triggerSync,
        clearLogs,
        getLocalCache,
        setLocalCache,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
