import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'sprite-slicer-db';
const STORE_NAME = 'directory-handles';
const HANDLE_KEY = 'auto-save-directory';

// Extend Window for File System Access API
declare global {
  interface Window {
    showDirectoryPicker?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle>;
  }
  
  interface FileSystemDirectoryHandle {
    queryPermission?: (options: { mode: 'read' | 'readwrite' }) => Promise<'granted' | 'denied' | 'prompt'>;
    requestPermission?: (options: { mode: 'read' | 'readwrite' }) => Promise<'granted' | 'denied' | 'prompt'>;
  }
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function saveHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(handle, HANDLE_KEY);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    
    transaction.oncomplete = () => db.close();
  });
}

async function loadHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(HANDLE_KEY);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
      
      transaction.oncomplete = () => db.close();
    });
  } catch {
    return null;
  }
}

async function clearHandle(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(HANDLE_KEY);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    
    transaction.oncomplete = () => db.close();
  });
}

async function verifyPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  try {
    if (!handle.queryPermission || !handle.requestPermission) {
      return false;
    }
    
    // Check if we already have permission
    if ((await handle.queryPermission({ mode: 'readwrite' })) === 'granted') {
      return true;
    }
    
    // Request permission if needed
    if ((await handle.requestPermission({ mode: 'readwrite' })) === 'granted') {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

export function useDirectoryHandle() {
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [directoryName, setDirectoryName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  // Load handle from IndexedDB on mount
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const handle = await loadHandle();
      
      if (handle) {
        setDirectoryHandle(handle);
        setDirectoryName(handle.name);
        // Check permission without prompting
        const permitted = handle.queryPermission 
          ? (await handle.queryPermission({ mode: 'readwrite' })) === 'granted'
          : false;
        setHasPermission(permitted);
      }
      
      setIsLoading(false);
    }
    
    init();
  }, []);

  const selectDirectory = useCallback(async (): Promise<FileSystemDirectoryHandle | null> => {
    if (!window.showDirectoryPicker) {
      return null;
    }
    
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      await saveHandle(handle);
      setDirectoryHandle(handle);
      setDirectoryName(handle.name);
      setHasPermission(true);
      return handle;
    } catch (err) {
      // User cancelled or API not supported
      if ((err as Error).name !== 'AbortError') {
        console.error('Failed to select directory:', err);
      }
      return null;
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!directoryHandle) return false;
    
    const permitted = await verifyPermission(directoryHandle);
    setHasPermission(permitted);
    return permitted;
  }, [directoryHandle]);

  const clearDirectory = useCallback(async () => {
    await clearHandle();
    setDirectoryHandle(null);
    setDirectoryName(null);
    setHasPermission(false);
  }, []);

  return {
    directoryHandle,
    directoryName,
    isLoading,
    hasPermission,
    selectDirectory,
    requestPermission,
    clearDirectory,
  };
}
