import { useState, useEffect, useCallback } from 'react';

// Event to sync state across hooks
const STORAGE_EVENT = 'talist-storage';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  
  // Track if we've hydrated from client storage
  const [hydrated, setHydrated] = useState(false);

  // Initialize state on mount (client-side only)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
      setHydrated(true);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      setHydrated(true); // Still mark as hydrated even if error
    }
  }, [key]);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Dispatch event for other hooks
        window.dispatchEvent(new Event(STORAGE_EVENT));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Listen for changes from other components
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          const newValue = JSON.parse(item);
          // Only update if value matches type (basic check)
          setStoredValue(newValue);
        }
      } catch (error) {
        // Ignore
      }
    };

    window.addEventListener(STORAGE_EVENT, handleStorageChange);
    // Also listen to native storage event (cross-tab)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener(STORAGE_EVENT, handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  // Return initialValue until hydrated to prevent mismatch
  return [hydrated ? storedValue : initialValue, setValue];
}
