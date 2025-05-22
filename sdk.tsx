import { useEffect, useState } from 'react';

interface TagConfiguration {
  staticLabels?: Record<string, string>;
  cookieLabels?: string[];
  urlLabels?: string[];
}

interface UseTagBuilderResult {
  builtUrl: string | null;
  isLoading: boolean;
  error: Error | null;
}

const useTagBuilder = (config: {
  baseUrl: string;
  tags?: TagConfiguration;
}): UseTagBuilderResult => {
  const [result, setResult] = useState<UseTagBuilderResult>({
    builtUrl: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const buildUrl = () => {
      try {
        // Проверяем базовый URL
        if (!config.baseUrl) {
          throw new Error('Base URL is required');
        }

        let url: URL;
        try {
          url = new URL(config.baseUrl);
        } catch (e) {
          throw new Error(`Invalid base URL: ${config.baseUrl}`);
        }

        const params = new URLSearchParams();

        // Добавляем статические параметры (если есть)
        if (config.tags?.staticLabels) {
          for (const [key, value] of Object.entries(config.tags.staticLabels)) {
            if (value) {
              params.append(key, value);
            }
          }
        }

        // Проверяем параметры в текущем URL (только в браузере)
        if (typeof window !== 'undefined' && config.tags?.urlLabels) {
          try {
            const currentUrl = new URL(window.location.href);
            for (const param of config.tags.urlLabels) {
              const value = currentUrl.searchParams.get(param);
              if (value) {
                params.append(param, value);
              }
            }
          } catch (e) {
            console.warn('Failed to parse current URL', e);
          }

          // Проверяем cookies (если есть параметры для проверки)
          if (config.tags.cookieLabels) {
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
        }

        // Обновляем URL только если есть параметры
        if (params.toString()) {
          url.search = params.toString();
        }

        setResult({
          builtUrl: url.toString(),
          isLoading: false,
          error: null
        });
      } catch (error) {
        setResult({
          builtUrl: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown error')
        });
      }
    };

    buildUrl();
  }, [config]);

  return result;
};

export default useTagBuilder;