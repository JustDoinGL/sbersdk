
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

// Типы для формы
interface FormData {
  field1: string;
  field2: string;
}

// Event Emitter для поля 1
class Field1Emitter {
  private listeners: ((value: string) => void)[] = [];

  subscribe(listener: (value: string) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(value: string) {
    this.listeners.forEach(listener => listener(value));
  }
}

// Event Emitter для поля 2
class Field2Emitter {
  private listeners: ((value: string) => void)[] = [];

  subscribe(listener: (value: string) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(value: string) {
    this.listeners.forEach(listener => listener(value));
  }
}

// Создаем экземпляры эмиттеров
const field1Emitter = new Field1Emitter();
const field2Emitter = new Field2Emitter();

const ConnectedForm: React.FC = () => {
  const { register, setValue, watch } = useForm<FormData>({
    defaultValues: {
      field1: '',
      field2: '',
    },
  });

  // Получаем текущие значения
  const field1Value = watch('field1');
  const field2Value = watch('field2');

  // Лисенер для поля 1 - при изменении поля 1 меняем поле 2
  useEffect(() => {
    const unsubscribe = field1Emitter.subscribe((value) => {
      // Трансформируем значение для поля 2
      const transformedValue = `From Field1: ${value}`;
      setValue('field2', transformedValue, { shouldValidate: true });
    });

    return unsubscribe;
  }, [setValue]);

  // Лисенер для поля 2 - при изменении поля 2 меняем поле 1
  useEffect(() => {
    const unsubscribe = field2Emitter.subscribe((value) => {
      // Трансформируем значение для поля 1
      const transformedValue = `From Field2: ${value}`;
      setValue('field1', transformedValue, { shouldValidate: true });
    });

    return unsubscribe;
  }, [setValue]);

  // Обработчики изменений полей
  const handleField1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Эмитим изменение в эмиттер поля 1
    field1Emitter.emit(value);
  };

  const handleField2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Эмитим изменение в эмиттер поля 2
    field2Emitter.emit(value);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>Св