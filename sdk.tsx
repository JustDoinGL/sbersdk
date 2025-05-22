import { useMemo } from 'react';
import Cookies from 'js-cookie';

interface UrlConfig {
  url: string;
  tags: {
    staticLabels: Record<string, string>;
    cookieLabels: string[];
    urlLabels: string[];
  };
}

interface UrlBuilderResult {
  query: string;
  button: string;
}

const useBuildUrl = ({ query, button }: { query: UrlConfig; button: UrlConfig }): UrlBuilderResult => {
  const buildUrl = (config: UrlConfig): string => {
    const { url: baseUrl, tags } = config;
    const { staticLabels, cookieLabels, urlLabels } = tags;
    const url = new URL(baseUrl);

    // Добавляем статические параметры
    Object.entries(staticLabels).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });

    // Добавляем параметры из cookies
    cookieLabels.forEach(key => {
      try {
        const value = Cookies.get(key);
        if (value) {
          url.searchParams.set(key, value);
        }
      } catch (e) {
        console.warn(`Failed to read cookie "${key}"`, e);
      }
    });

    // Добавляем параметры из текущего URL
    if (typeof window !== 'undefined') {
      const currentParams = new URLSearchParams(window.location.search);
      urlLabels.forEach(key => {
        const value = currentParams.get(key);
        if (value) {
          url.searchParams.set(key, value);
        }
      });
    }

    return url.toString();
  };

  return useMemo(() => ({
    query: buildUrl(query),
    button: buildUrl(button)
  }), [query, button]);
};

export default useBuildUrl;