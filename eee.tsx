// externalStore.ts
interface FormState {
  isSecondStep: boolean;
  scrollElement: HTMLElement | null;
  status: string | null;
  timerId: NodeJS.Timeout | null;
}

let formState: FormState = {
  isSecondStep: false,
  scrollElement: null,
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
  
  // Методы для управления таймером
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
import { useSyncExternalStore } from 'react';
import { formStore } from './externalStore';

export const useFormStore = () => {
  const state = useSyncExternalStore(
    formStore.subscribe,
    formStore.getSnapshot
  );

  return {
    ...state,
    setState: formStore.setState,
    clearTimer: formStore.clearTimer,
    setTimer: formStore.setTimer
  };
};


// FormComponent.tsx
import React, { useRef, useCallback } from 'react';
import { useFormStore } from './useFormStore';
import { useDispatch } from 'react-redux'; // или ваш стор менеджмент

interface FormComponentProps {
  className?: string;
}

export const FormComponent: React.FC<FormComponentProps> = ({ className }) => {
  const dispatch = useDispatch();
  const formRef = useRef<HTMLDivElement>(null);
  
  const { 
    isSecondStep, 
    scrollElement, 
    setState, 
    clearTimer, 
    setTimer 
  } = useFormStore();

  // Функция для управления таймером и прокруткой
  const handleTimerLogic = useCallback(() => {
    if (timerRef.current) {
      clearTimer();
      dispatch(submitRequest({
        analyticalabel: null 
      }));
      setState({ isSecondStep: false });
    } else {
      console.log('timerRef.current', timerRef.current);
      setState({ isSecondStep: true });
      
      // Прокрутка к элементу через ref
      if (formRef.current) {
        setState({ scrollElement: formRef.current });
        formRef.current.scrollIntoView({
          behavior: 'smooth', 
          block: 'center' 
        });
      }

      const timerId = setTimeout(() => {
        dispatch(submitRequest({
          analyticalabel: null 
        }));
        setState({ isSecondStep: false });
      }, 30000);
      
      setTimer(timerId);
    }
  }, [dispatch, setState, clearTimer, setTimer]);

  const onClickHandler = useCallback((status: Status) => {
    if (status === 'success') reset();
    dispatch(actions.setStatusError(null));
  }, [dispatch]);

  return (
    <Section className={cx(CLASS_NAME, className)}>
      <div 
        ref={formRef}
        className={cx(`${CLASS_NAME}__inner`)} 
      >
        <div className={cx(`${CLASS_NAME}__outer`)}>
          <div className={cx(`${CLASS_NAME}__form`)}>
            <Picture 
              className={cx(`${CLASS_NAME}__form-picture`)} 
              {...formBlock.picture}
            />
            
            <div className={cx(`${CLASS_NAME}__form-content`)}>
              <div className={cx(`${CLASS_NAME}__form-layout`)}>
                <QRBlock urllayer={urllayer} qrBlock={qrBlock}/>
                
                <div className={applicationWrapperClass}>
                  {!status && (
                    <div className={cx(`${CLASS_NAME}__form-desc`)}>
                      <Title
                        className={cx(`${CLASS_NAME}__form-title`)}
                        text={formBlock.title}
                        family="display"
                        level={2}
                        theme="light"
                      />
                      {/* Остальной контент */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};




// useScrollManager.ts
import { useRef, useCallback } from 'react';
import { useFormStore } from './useFormStore';

export const useScrollManager = () => {
  const { setState, scrollElement } = useFormStore();
  const elementRef = useRef<HTMLDivElement>(null);

  const registerElement = useCallback((element: HTMLDivElement | null) => {
    if (element) {
      setState({ scrollElement: element });
    }
  }, [setState]);

  const scrollToElement = useCallback(() => {
    if (scrollElement) {
      scrollElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [scrollElement]);

  return {
    elementRef,
    registerElement,
    scrollToElement,
    scrollElement
  };
};




// В вашем компоненте
const MyComponent = () => {
  const { 
    isSecondStep, 
    setState, 
    elementRef, 
    scrollToElement 
  } = useScrollManager();

  // Теперь вы можете использовать:
  // - elementRef для привязки к DOM элементу
  // - scrollToElement для прокрутки
  // - isSecondStep для состояния формы
  // - setState для обновления состояния

  return (
    <div ref={elementRef}>
      {/* ваш контент */}
    </div>
  );
};





