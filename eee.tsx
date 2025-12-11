import { useState, useEffect, useRef } from 'react';
import { useGetAct } from './path-to-your-useGetAct-hook'; // Укажите правильный путь
import { ActDto } from './path-to-your-types'; // Укажите правильный путь

interface UseGetActWithPollingOptions {
  statuses: string[];
  ordering: string;
  pollInterval?: number;
  enabled?: boolean;
}

interface UseGetActWithPollingResult {
  data: ActDto[] | undefined;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
  isPolling: boolean;
  stopPolling: () => void;
  startPolling: () => void;
}

export function useGetActWithPolling({
  statuses,
  ordering,
  pollInterval = 30000, // 30 секунд по умолчанию
  enabled = true
}: UseGetActWithPollingOptions): UseGetActWithPollingResult {
  const [isPolling, setIsPolling] = useState(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<ActDto[] | undefined>(undefined);

  // Используем существующий хук useGetAct
  const { data, isLoading, error, refetch } = useGetAct({
    statuses,
    ordering,
    enabled: enabled && isPolling // Передаем флаг enabled для управления запросом
  });

  // Проверяем, нужно ли продолжать опрос
  const shouldContinuePolling = (): boolean => {
    if (!data || data.length === 0) return false;
    
    // Считаем количество актов, которые могут быть подписаны
    // Предположим, что в ActDto есть поле count или можно вычислить количество
    // Если такого поля нет, адаптируйте логику под вашу структуру данных
    
    // Пример 1: Если в ActDto есть поле count
    // const totalCount = data.reduce((sum, act) => sum + (act.count || 0), 0);
    // return totalCount > 0;
    
    // Пример 2: Если нужно проверять по статусам
    // return data.some(act => act.status === 'pending');
    
    // Пример 3: Если нужно проверять наличие определенных актов
    // return data.length > 0;
    
    // В вашем случае, судя по коду, опрос продолжается пока есть акты для подписи
    // Используем длину массива как индикатор
    return data.length > 0;
  };

  // Начинаем опрос
  const startPolling = () => {
    if (!isPolling) {
      setIsPolling(true);
    }
  };

  // Останавливаем опрос
  const stopPolling = () => {
    if (isPolling) {
      setIsPolling(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  };

  // Функция для ручного обновления
  const handleManualRefetch = () => {
    refetch();
  };

  // Эффект для управления интервалом опроса
  useEffect(() => {
    if (!isPolling || !enabled) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Начинаем интервальный опрос
    pollingIntervalRef.current = setInterval(() => {
      refetch();
    }, pollInterval);

    // Очистка интервала при размонтировании
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isPolling, enabled, pollInterval, refetch]);

  // Эффект для проверки данных и остановки опроса
  useEffect(() => {
    if (data && !isLoading) {
      lastDataRef.current = data;
      
      // Проверяем, нужно ли продолжать опрос
      if (!shouldContinuePolling() && isPolling) {
        stopPolling();
      }
      
      // Если данных нет, но опрос был остановлен, можно снова начать при появлении данных
      if (shouldContinuePolling() && !isPolling) {
        startPolling();
      }
    }
  }, [data, isLoading]);

  return {
    data,
    isLoading,
    error,
    refetch: handleManualRefetch,
    isPolling,
    stopPolling,
    startPolling
  };
}