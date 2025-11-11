// types.ts
export type DictMap = Record<number, { name: string }>;

export type RefKeys = string;

export const LONG_DASH = '—';


// referencesService.ts
type Subscriber = () => void;

class ReferencesService {
  private subscribers = new Set<Subscriber>();
  private isInitialized = false;
  private initializationError: Error | null = null;

  private emitChange() {
    this.subscribers.forEach(subscriber => subscriber());
  }

  subscribe(subscriber: Subscriber) {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }

  getSnapshot() {
    return {
      isInitialized: this.isInitialized,
      error: this.initializationError
    };
  }

  async init() {
    if (this.isInitialized) return;

    try {
      // Здесь должна быть логика инициализации
      // Например, загрузка данных с сервера
      await this.loadReferences();
      
      this.isInitialized = true;
      this.initializationError = null;
    } catch (error) {
      this.initializationError = error instanceof Error ? error : new Error('Unknown error');
      console.error('Failed to initialize services:', error);
    } finally {
      this.emitChange();
    }
  }

  private async loadReferences() {
    // Загрузка reference данных
    // Пример: await api.loadReferences();
  }

  // Методы для работы с данными
  getDictSet(key: RefKeys) {
    if (!this.isInitialized) {
      console.warn('Service not initialized');
      return [];
    }

    const stringifyDict = sessionStorage.getItem(key);
    if (!stringifyDict) return [];

    try {
      const map: DictMap = JSON.parse(stringifyDict);
      return Object.values(map);
    } catch {
      console.warn(`Error parsing dictionary for key: ${key}`);
      return [];
    }
  }

  getReferenceLabel(key: RefKeys, value?: number | null): string {
    if (!value) {
      console.warn('No value provided for reference');
      return LONG_DASH;
    }

    const stringifyDict = sessionStorage.getItem(key);
    if (!stringifyDict) {
      console.warn(`Unknown key for reference: ${key}`);
      return LONG_DASH;
    }

    try {
      const map: DictMap = JSON.parse(stringifyDict);
      return map[value]?.name || LONG_DASH;
    } catch {
      console.warn(`Error parsing dictionary ${key} for value: ${value}`);
      return LONG_DASH;
    }
  }

  getReferenceValue(key: RefKeys, value?: number | null) {
    if (!value) {
      console.warn('No value provided for reference');
      return null;
    }

    const stringifyDict = sessionStorage.getItem(key);
    if (!stringifyDict) {
      console.warn(`Unknown key for reference: ${key}`);
      return null;
    }

    try {
      const map: DictMap = JSON.parse(stringifyDict);
      return map[value] || null;
    } catch {
      console.warn(`Error parsing dictionary ${key} for value: ${value}`);
      return null;
    }
  }
}

export const referencesService = new ReferencesService();



// hooks/useReferencesStore.ts
import { useSyncExternalStore } from 'react';
import { referencesService } from '../referencesService';

export const useReferencesStore = () => {
  const state = useSyncExternalStore(
    referencesService.subscribe.bind(referencesService),
    referencesService.getSnapshot.bind(referencesService)
  );

  return {
    ...state,
    getDictSet: referencesService.getDictSet.bind(referencesService),
    getReferenceLabel: referencesService.getReferenceLabel.bind(referencesService),
    getReferenceValue: referencesService.getReferenceValue.bind(referencesService),
    init: referencesService.init.bind(referencesService)
  };
};




// ServiceProvider.tsx
import { FC, ReactNode, useEffect } from 'react';
import { Alert, Spinner } from '@sg/UIkit';
import { useReferencesStore } from '../hooks/useReferencesStore';

const LoadingState: FC = () => (
  <div
    style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Spinner size={64} />
  </div>
);

const ErrorState: FC<{ error: Error }> = ({ error }) => (
  <div
    style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Alert
      type="error"
      title="Ошибка загрузки сервисов"
      description={error.message}
    />
  </div>
);

export const ServiceProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { isInitialized, error, init } = useReferencesStore();

  useEffect(() => {
    init();
  }, [init]);

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!isInitialized) {
    return <LoadingState />;
  }

  return <>{children}</>;
};







