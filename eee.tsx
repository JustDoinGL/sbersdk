import { useEffect, useRef, useState, useCallback } from 'react';

interface UsePollingForUnsignedActsProps<T> {
  entities: T[];
  hasUnsignedStatus: (entity: T) => boolean;
  refetch: () => Promise<void> | void;
  pollingInterval?: number;
  enabled?: boolean;
}

export const usePollingForUnsignedActs = <T>({
  entities,
  hasUnsignedStatus,
  refetch,
  pollingInterval = 30000,
  enabled = true,
}) => {
  const [isPolling, setIsPolling] = useState(false);
  const [unsignedCount, setUnsignedCount] = useState(0);
  
  const timerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (!enabled || !isMountedRef.current) return;
    setIsPolling(true);
  }, [enabled]);

  useEffect(() => {
    if (!isMountedRef.current || !enabled) return;

    const unsignedEntities = entities?.filter(hasUnsignedStatus) || [];
    const newUnsignedCount = unsignedEntities.length;
    
    setUnsignedCount(newUnsignedCount);

    if (newUnsignedCount > 0 && !isPolling) {
      startPolling();
    } else if (newUnsignedCount === 0 && isPolling) {
      stopPolling();
    }
  }, [entities, hasUnsignedStatus, isPolling, enabled, startPolling, stopPolling]);

  useEffect(() => {
    if (!isPolling || !enabled) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (isMountedRef.current && isPolling) {
        refetch();
      }
    }, pollingInterval);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPolling, refetch, pollingInterval, enabled]);

  return {
    isPolling,
    unsignedCount,
    stopPolling,
    startPolling,
  };
};