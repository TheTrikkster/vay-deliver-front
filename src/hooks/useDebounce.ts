import { useState, useEffect, useRef } from 'react';

export function useDebounce<T>(value: T, delay = 1000): T {
  const [debounced, setDebounced] = useState(value);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => setDebounced(value), delay);
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [value, delay]);

  return debounced;
}
