import { useState, useEffect } from 'react';

export function useLocalStorageState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn(`Failed to read localStorage key "${key}":`, err);
    }
    return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.warn(`Failed to write localStorage key "${key}":`, err);
    }
  }, [key, state]);

  return [state, setState];
}
