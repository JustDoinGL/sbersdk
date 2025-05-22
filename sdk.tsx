import { useMemo } from 'react';
import Cookies from 'js-cookie';

interface BuildUrlOptions {
  baseUrl: string;
  staticParams?: Record<string, string>;
  cookieParams?: string[];
  queryParams?: string[];
}

const getQueryParam = (param: string): string | null => {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

const useBuildUrl = ({
  baseUrl,
  staticParams = {},
  cookieParams = [],
  queryParams = [],
}: BuildUrlOptions): string => {
  return useMemo(() => {
    const url = new URL(baseUrl);

    // Добавляем статические параметры
    Object.entries(staticParams).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });

    // Добавляем параметры из cookies (используем js-cookie)
    cookieParams.forEach(key => {
      const value = Cookies.get(key);
      if (value) url.searchParams.set(key, value);
    });

    // Добавляем параметры из query string текущего URL
    queryParams.forEach(key => {
      const value = getQueryParam(key);
      if (value) url.searchParams.set(key, value);
    });

    return url.toString();
  }, [baseUrl, staticParams, cookieParams, queryParams]);
};

export default useBuildUrl;