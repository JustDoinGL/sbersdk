
// externalStore.ts
interface FormState {
  isSecondStep: boolean;
  scrollElementRef: React.RefObject<HTMLElement> | null;
  status: string | null;
  timerId: NodeJS.Timeout | null;
}

let formState: FormState = {
  isSecondStep: false,
  scrollElementRef: null,
  status: null,
  timerId: null
};

let listeners: (() => void)[] = [];

export const formStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
  
  getSnapshot() {
    return formState;
  },
  
  setState(newState: Partial<FormState>) {
    formState = { ...formState, ...newState };
    listeners.forEach(listener => listener());
  },
  
  // Регистрация ref в сторе
  registerScrollRef(ref: React.RefObject<HTMLElement>) {
    formState.scrollElementRef = ref;
    listeners.forEach(listener => listener());
  },
  
  // Прокрутка к зарегистрированному элементу
  scrollToElement() {
    if (formState.scrollElementRef?.current) {
      formState.scrollElementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  },
  
  clearTimer() {
    if (formState.timerId) {
      clearTimeout(formState.timerId);
      formState.timerId = null;
    }
  },
  
  setTimer(timerId: NodeJS.Timeout) {
    formState.timerId = timerId;
    listeners.forEach(listener => listener());
  }
};

// useFormStore.ts
import { useSyncExternalStore, useRef, useEffect } from 'react';
import { formStore } from './externalStore';

export const useFormStore = () => {
  const state = useSyncExternalStore(
    formStore.subscribe,
    formStore.getSnapshot
  );

  // Создаем ref и автоматически регистрируем его в сторе
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      formStore.registerScrollRef(scrollRef);
    }
  }, []);

  return {
    ...state,
    scrollRef, // возвращаем ref для использования в JSX
    setState: formStore.setState,
    scrollToElement: formStore.scrollToElement,
    clearTimer: formStore.clearTimer,
    setTimer: formStore.setTimer
  };
};
