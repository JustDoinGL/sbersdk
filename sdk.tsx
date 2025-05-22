import { useEffect, useState } from 'react';

interface TagConfiguration {
  staticLabels: Record<string, string>;
  cookieLabels: string[];
  urlLabels: string[];
}

interface UseTagBuilderResult {
  builtUrl: string;
  isLoading: boolean;
}

const useTagBuilder = (config: {
  baseUrl: string;
  tags: TagConfiguration;
}): UseTagBuilderResult => {
  const [builtUrl, setBuiltUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const buildUrl = () => {
      const url = new URL(config.baseUrl);
      const params = new URLSearchParams();

      // Добавляем статические параметры
      for (const [key, value] of Object.entries(config.tags.staticLabels)) {
        if (value) {
          params.append(key, value);
        }
      }

      // Проверяем параметры в текущем URL
      if (typeof window !== 'undefined') {
        const currentUrl = new URL(window.location.href);
        for (const param of config.tags.urlLabels) {
          const value = currentUrl.searchParams.get(param);
          if (value) {
            params.append(param, value);
          }
        }

        // Проверяем cookies
        const cookies = document.cookie.split(';');
        for (const param of config.tags.cookieLabels) {
          const foundCookie = cookies.find(cookie => 
            cookie.trim().startsWith(`${param}=`)
          );
          if (foundCookie) {
            params.append(param, foundCookie.split('=')[1].trim());
          }
        }
      }

      // Собираем итоговый URL
      url.search = params.toString();
      setBuiltUrl(url.toString());
      setIsLoading(false);
    };

    buildUrl();
  }, [config]);

  return { builtUrl, isLoading };
};

export default useTagBuilder;