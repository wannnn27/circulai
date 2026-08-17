/**
 * @file useDebounce.js
 * @description Custom hook that debounces a rapidly-changing value.
 *
 * Returns a version of `value` that only updates after `delay` milliseconds
 * of silence. Ideal for search inputs where you want to avoid triggering
 * expensive filter/re-render operations on every keystroke.
 *
 * Usage:
 *   const debouncedQuery = useDebounce(query, 250);
 *   // Use debouncedQuery in useMemo/useEffect instead of query directly.
 */

import { useEffect, useState } from 'react';

/**
 * @param {*}      value  The value to debounce.
 * @param {number} delay  Debounce delay in milliseconds. Defaults to 250.
 * @returns {*} The debounced value.
 */
export function useDebounce(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the previous timeout if value changes before delay expires.
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
