import { useCallback, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';

// Кастомный хук для дебаунса
function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

function MyForm() {
  const { register, control } = useForm({
    defaultValues: {
      search: '',
      email: ''
    }
  });

  // Отслеживаем значение поля
  const searchValue = useWatch({
    control,
    name: 'search'
  });

  const emailValue = useWatch({
    control,
    name: 'email'
  });

  // Функция, которая будет вызываться после дебаунса
  const handleFieldChange = useCallback((fieldName, value) => {
    console.log(`Поле ${fieldName} изменилось:`, value);
    // Здесь можно делать API запросы, валидацию и т.д.
  }, []);

  const debouncedHandler = useDebounce(handleFieldChange, 500);

  // Отслеживаем изменения поля search
  useEffect(() => {
    if (searchValue !== undefined) {
      debouncedHandler('search', searchValue);
    }
  }, [searchValue, debouncedHandler]);

  // Отслеживаем изменения поля email
  useEffect(() => {
    if (emailValue !== undefined) {
      debouncedHandler('email', emailValue);
    }
  }, [emailValue, debouncedHandler]);

  return (
    <form>
      <input
        {...register('search')}
        placeholder="Поиск..."
      />
      <input
        {...register('email')}
        placeholder="Email"
        type="email"
      />
    </form>
  );
}