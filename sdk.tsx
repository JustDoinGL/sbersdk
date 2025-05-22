import { useMemo } from 'react';
import Cookies from 'js-cookie';

interface BuildUrlOptions {
  baseUrl: string;
  staticParams?: Record<string, string>;
  cookieParams?: string[];
  queryParams?: string[];
}

const useBuildUrl = ({
  baseUrl,
  staticParams = {},
  cookieParams = [],
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

    // 2. Добавляем параметры из cookies (используем js-cookie)
    cookieParams.forEach(key => {
      try {
        const value = Cookies.get(key);
        if (value) {
          url.searchParams.set(key, value);
        }
      } catch (e) {
        console.warn(`Failed to read cookie "${key}"`, e);
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
  }, [baseUrl, staticParams, cookieParams, queryParams]);
};

export default useBuildUrl;