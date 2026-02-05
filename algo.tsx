import { useSyncExternalStore } from 'react';

// Типы для хранилища
type State = {
  count: number;
  data: string[];
  isLoading: boolean;
};

type Store = {
  getState: () => State;
  subscribe: (listener: () => void) => () => void;
  increment: () => void;
  decrement: () => void;
  addItem: (item: string) => void;
  removeItem: (index: number) => void;
  setLoading: (loading: boolean) => void;
};

// Создаем хранилище
const createStore = (initialState: State): Store => {
  let state = initialState;
  const listeners = new Set<() => void>();

  const getState = () => state;

  const setState = (newState: State) => {
    state = newState;
    listeners.forEach(listener => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  // Методы для изменения состояния
  const increment = () => {
    setState({
      ...state,
      count: state.count + 1
    });
  };

  const decrement = () => {
    setState({
      ...state,
      count: state.count - 1
    });
  };

  const addItem = (item: string) => {
    setState({
      ...state,
      data: [...state.data, item]
    });
  };

  const removeItem = (index: number) => {
    setState({
      ...state,
      data: state.data.filter((_, i) => i !== index)
    });
  };

  const setLoading = (loading: boolean) => {
    setState({
      ...state,
      isLoading: loading
    });
  };

  return {
    getState,
    subscribe,
    increment,
    decrement,
    addItem,
    removeItem,
    setLoading
  };
};

// Создаем экземпляр хранилища
const store = createStore({
  count: 0,
  data: [],
  isLoading: false
});

// Хук для использования в компонентах
export const useStore = () => {
  const state = useSyncExternalStore(
    store.subscribe,
    store.getState
  );

  // Возвращаем состояние и методы
  return {
    state,
    methods: {
      increment: store.increment,
      decrement: store.decrement,
      addItem: store.addItem,
      removeItem: store.removeItem,
      setLoading: store.setLoading
    }
  };
};
