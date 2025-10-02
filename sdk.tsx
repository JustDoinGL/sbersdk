
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

// Создаем контекст для общего поля
const SharedFieldContext = createContext();

// Провайдер для общего поля
export const SharedFieldProvider = ({ children }) => {
  const [sharedValue, setSharedValue] = useState('');
  
  useEffect(() => {
    // Обновляем значение каждую секунду (если нужно)
    const interval = setInterval(() => {
      // Здесь можно добавить логику обновления
      console.log('Текущее общее значение:', sharedValue);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [sharedValue]);

  return (
    <SharedFieldContext.Provider value={{ sharedValue, setSharedValue }}>
      {children}
    </SharedFieldContext.Provider>
  );
};

// Хук для использования общего поля
export const useSharedField = () => {
  const context = useContext(SharedFieldContext);
  if (!context) {
    throw new Error('useSharedField must be used within SharedFieldProvider');
  }
  return context;
};

// Первая форма
const FormA = () => {
  const { register, watch } = useForm();
  const { setSharedValue } = useSharedField();
  
  const fieldValue = watch('sharedField');

  // Отслеживаем изменения поля и обновляем общее значение
  useEffect(() => {
    if (fieldValue !== undefined) {
      setSharedValue(fieldValue);
    }
  }, [fieldValue, setSharedValue]);

  return (
    <div style={{ border: