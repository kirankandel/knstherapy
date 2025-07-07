import { useEffect, useRef } from 'react';

/**
 * Custom hook for managing intervals that automatically cleanup
 * and can be safely updated without causing infinite loops
 */
export const useInterval = (callback, delay) => {
  const savedCallback = useRef();
  const intervalRef = useRef();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (delay !== null) {
      intervalRef.current = setInterval(() => {
        if (savedCallback.current) {
          savedCallback.current();
        }
      }, delay);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [delay]);

  // Return a function to manually clear the interval
  const clearManually = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return clearManually;
};

export default useInterval;
