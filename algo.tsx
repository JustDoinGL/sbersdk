import { useState, useEffect, useCallback } from 'react';


interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFetch<T = unknown>(
  url: string,
  options?: 
): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Функция выполнения запроса
  const executeFetch = useCallback(async () => {

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url, {
        ...fetchOptions
      });

      const responseData: T = await response.json();
      setData(responseData);
    } catch (err: any) {
        setError(err.message || 'An error occurred while fetching data');
      }
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  // Эффект для автоматического выполнения запроса
  useEffect(() => {
    if (enabled) {
      executeFetch();
    }
  }, [executeFetch, enabled]);


  return {
    data,
    loading,
    error,
    refetch,
    setData,
  };
}
