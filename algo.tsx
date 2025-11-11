import { api, References } from "@/5_shared/api";
import { LONG_DASH } from "../consts";

type RefKeys = keyof References;
type DictMap = Record<number, References[RefKeys][number]>;

class ReferencesService {
  private subscribers = new Set<() => void>();
  private state = { 
    isInitialized: false, 
    error: null as Error | null 
  };

  // Методы для useSyncExternalStore
  subscribe = (callback: () => void) => {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  };

  getSnapshot = () => this.state;

  private notify = () => {
    this.subscribers.forEach(callback => callback());
  };

  public async init() {
    if (this.state.isInitialized) return;

    try {
      const response = await api.reference_methods.getReferences();
      const keys = Object.keys(response) as RefKeys[];

      keys.forEach((key) => {
        const dictMap: DictMap = response[key].reduce((acc, rec) => {
          acc[rec.id] = rec;
          return acc;
        }, {} as DictMap);
        
        sessionStorage.setItem(key, JSON.stringify(dictMap));
      });

      this.state = { isInitialized: true, error: null };
    } catch (error) {
      console.error("Failed to fetch References:", error);
      this.state = { 
        isInitialized: false, 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    } finally {
      this.notify();
    }
  }

  public getDictMap(key: RefKeys): DictMap | null {
    const stringifyDict = sessionStorage.getItem(key);

    if (stringifyDict) {
      try {
        return JSON.parse(stringifyDict);
      } catch {
        return null;
      }
    }
    return null;
  }

  public getDictSet(key: RefKeys): References[RefKeys] {
    const stringifyDict = sessionStorage.getItem(key);

    if (stringifyDict) {
      try {
        const map: DictMap = JSON.parse(stringifyDict);
        return Object.values(map);
      } catch {
        return [];
      }
    }
    return [];
  }

  public getReferenceLabel(key: RefKeys, value?: number | null): string {
    if (!value) {
      console.warn("Не передан ключ для reference.");
      return LONG_DASH;
    }

    const stringifyDict = sessionStorage.getItem(key);
    if (!stringifyDict) {
      console.warn("Неизвестный ключ для reference: ", key);
      return LONG_DASH;
    }

    try {
      const map: DictMap = JSON.parse(stringifyDict);
      return map[value]?.name || LONG_DASH;
    } catch {
      console.warn("Ошибка при JSON.parse словаря", key, "по ключу", value);
      return LONG_DASH;
    }
  }

  public getReferenceValue(key: RefKeys, value?: number | null) {
    if (!value) {
      console.warn("Не передан ключ для reference.");
      return null;
    }

    const stringifyDict = sessionStorage.getItem(key);
    if (!stringifyDict) {
      console.warn("Неизвестный ключ для reference: ", key);
      return null;
    }

    try {
      const map: DictMap = JSON.parse(stringifyDict);
      return map[value] || null;
    } catch {
      console.warn("Ошибка при JSON.parse словаря", key, "по ключу", value);
      return null;
    }
  }
}

export const referencesService = new ReferencesService();