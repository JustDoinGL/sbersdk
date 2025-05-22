import { useMemo } from 'react';
import Cookies from 'js-cookie';

interface BuildUrlOptions {
  baseUrl: string;
  staticParams?: Record<string, string>;
  localStorageParams?: string[];
  queryParams?: string[];
}

const useBuildUrl = ({
  baseUrl,
  staticParams = {},
  localStorageParams = [],
  queryParams = [],
}: BuildUrlOptions): string => {
  return useMemo(() => {
    const url = new URL(baseUrl);

    // 1. Добавляем статические параметры
    Object.entries(staticParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });

    // 2. Добавляем параметры из localStorage
    localStorageParams.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          url.searchParams.set(key, value);
        }
      } catch (e) {
        console.warn(`Failed to read localStorage key "${key}"`, e);
      }
    });

    // 3. Добавляем параметры из текущего URL
    if (typeof window !== 'undefined') {
      const currentParams = new URLSearchParams(window.location.search);
      queryParams.forEach(key => {
        const value = currentParams.get(key);
        if (value) {
          url.searchParams.set(key, value);
        }
      });
    }

    return url.toString();
  }, [baseUrl, staticParams, localStorageParams, queryParams]);
};

export default useBuildUrl;