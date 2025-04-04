import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Type definition for offline storage items
export interface OfflineStorageItem {
  id: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

export function useOfflineStorage<T>(
  key: string,
  syncFn?: (items: T[]) => Promise<void>
) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Function to get all items from storage
  const getItems = (): OfflineStorageItem[] => {
    try {
      const storedItems = localStorage.getItem(key);
      return storedItems ? JSON.parse(storedItems) : [];
    } catch (error) {
      console.error('Error getting items from offline storage:', error);
      return [];
    }
  };

  // Function to save items to storage
  const saveItems = (items: OfflineStorageItem[]): void => {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving items to offline storage:', error);
    }
  };

  // Add a new item to storage
  const addItem = (data: T): string => {
    const offlineId = uuidv4();
    const newItem: OfflineStorageItem = {
      id: offlineId,
      data: { ...data, offlineId, offlineCreated: true },
      timestamp: Date.now(),
      synced: isOnline,
    };

    const items = getItems();
    saveItems([...items, newItem]);
    return offlineId;
  };

  // Remove an item from storage
  const removeItem = (id: string): void => {
    const items = getItems();
    const filteredItems = items.filter(item => item.id !== id);
    saveItems(filteredItems);
  };

  // Get unsynced items
  const getUnsyncedItems = (): T[] => {
    const items = getItems();
    return items
      .filter(item => !item.synced)
      .map(item => item.data);
  };

  // Mark items as synced
  const markAsSynced = (ids: string[]): void => {
    const items = getItems();
    const updatedItems = items.map(item => {
      if (ids.includes(item.id)) {
        return { ...item, synced: true };
      }
      return item;
    });
    saveItems(updatedItems);
  };

  // Sync unsynced items with the server
  const syncItems = async (): Promise<boolean> => {
    if (!syncFn || !isOnline) return false;

    try {
      setIsSyncing(true);
      const unsyncedItems = getUnsyncedItems();
      
      if (unsyncedItems.length === 0) {
        setIsSyncing(false);
        return true;
      }

      await syncFn(unsyncedItems);
      
      // Mark all synced items
      const ids = unsyncedItems.map((item: any) => item.offlineId);
      markAsSynced(ids);
      
      setIsSyncing(false);
      return true;
    } catch (error) {
      console.error('Error syncing items:', error);
      setIsSyncing(false);
      return false;
    }
  };

  // Clear all items
  const clearItems = (): void => {
    localStorage.removeItem(key);
  };

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (syncFn) {
        syncItems();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Try to sync on initial load if online
    if (isOnline && syncFn) {
      syncItems();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncFn]);

  return {
    isOnline,
    isSyncing,
    addItem,
    removeItem,
    getItems: () => getItems().map(item => item.data),
    getUnsyncedItems,
    syncItems,
    clearItems,
  };
}