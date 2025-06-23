import { useState, useEffect, useRef } from 'react';

export function useFetch<T = unknown>(
  url: string,
  options?: RequestInit
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    // Отменяем предыдущий запрос (если был)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Создаём новый AbortController для текущего запроса
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch(url, {
        ...options,
        signal: abortController.signal, // Привязываем сигнал отмены
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const jsonData = (await response.json()) as T;
      setData(jsonData);
    } catch (err) {
      // Игнорируем ошибку, если запрос был отменён
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Запускаем запрос при изменении `url` или `options`
  useEffect(() => {
    fetchData();

    // Отменяем запрос при размонтировании
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [url, options]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    abort: () => abortControllerRef.current?.abort(),
  };
}