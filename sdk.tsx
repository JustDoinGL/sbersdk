import { useMemo } from 'react';
import { useCookies } from 'react-cookie';
import { useLocation } from 'react-router-dom';

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
  const [cookies] = useCookies();
  const { search } = useLocation();

  return useMemo(() => {
    const url = new URL(baseUrl);
    const searchParams = new URLSearchParams(search);

    // Добавляем статические параметры
    Object.entries(staticParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    // Добавляем параметры из cookies
    cookieParams.forEach(key => {
      const value = cookies[key];
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    // Добавляем параметры из query string текущего URL
    queryParams.forEach(key => {
      const value = searchParams.get(key);
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    return url.toString();
  }, [baseUrl, staticParams, cookieParams, queryParams, cookies, search]);
};

export default useBuildUrl;