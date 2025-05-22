import { useEffect, useState } from 'react';

interface TagConfiguration {
  staticLabels: Record<string, string>;
  cookieLabels: string[];
  urlLabels: string[];
}

interface UseTagCheckResult {
  allTags: Record<string, string>;
  isLoading: boolean;
}

const useTagCheck = (config: {
  url: string;
  tags: TagConfiguration;
}): UseTagCheckResult => {
  const [allTags, setAllTags] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const collectTags = () => {
      const result: Record<string, string> = {};

      // Add static labels first
      for (const [key, value] of Object.entries(config.tags.staticLabels)) {
        if (value) {
          result[key] = value;
        }
      }

      // Check URL parameters
      try {
        const url = new URL(config.url);
        for (const param of config.tags.urlLabels) {
          const value = url.searchParams.get(param);
          if (value) {
            result[param] = value;
          }
        }
      } catch (e) {
        console.error('Error parsing URL:', e);
      }

      // Check cookies if running in browser
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (const param of config.tags.cookieLabels) {
          const foundCookie = cookies.find(cookie => 
            cookie.trim().startsWith(`${param}=`)
          );
          if (foundCookie) {
            result[param] = foundCookie.split('=')[1].trim();
          }
        }
      }

      setAllTags(result);
      setIsLoading(false);
    };

    collectTags();
  }, [config]);

  return { allTags, isLoading };
};

export default useTagCheck;