// useSyncedForm.ts
import { useSyncExternalStore } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { formStore } from './formStore';

export const useSyncedForm = () => {
  // Подписка на стор
  const storeState = useSyncExternalStore(
    formStore.subscribe,
    formStore.getSnapshot
  );

  // Инициализация react-hook-form с значениями из стора
  const form = useForm({
    defaultValues: storeState.formData
  });

  const { control, setValue, getValues } = form;

  // Синхронизация изменений из формы в стор
  const username = useWatch({ control, name: 'username' });
  const email = useWatch({ control, name: 'email' });
  const phone = useWatch({ control, name: 'phone' });

  // Эффекты для синхронизации каждого поля
  React.useEffect(() => {
    if (username !== undefined) {
      formStore.setFieldValue('username', username);
    }
  }, [username]);

  React.useEffect(() => {
    if (email !== undefined) {
      formStore.setFieldValue('email', email);
    }
  }, [email]);

  React.useEffect(() => {
    if (phone !== undefined) {
      formStore.setFieldValue('phone', phone);
    }
  }, [phone]);

  // Функция для установки значения извне
  const setFieldValue = (fieldName: string, value: any) => {
    setValue(fieldName, value);
    formStore.setFieldValue(fieldName, value);
  };

  return {
    ...form,
    storeState,
    setFieldValue
  };
};


// useSyncedForm.ts
import { useSyncExternalStore } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { formStore } from './formStore';

export const useSyncedForm = () => {
  // Подписка на стор
  const storeState = useSyncExternalStore(
    formStore.subscribe,
    formStore.getSnapshot
  );

  // Инициализация react-hook-form с значениями из стора
  const form = useForm({
    defaultValues: storeState.formData
  });

  const { control, setValue, getValues } = form;

  // Синхронизация изменений из формы в стор
  const username = useWatch({ control, name: 'username' });
  const email = useWatch({ control, name: 'email' });
  const phone = useWatch({ control, name: 'phone' });

  // Эффекты для синхронизации каждого поля
  React.useEffect(() => {
    if (username !== undefined) {
      formStore.setFieldValue('username', username);
    }
  }, [username]);

  React.useEffect(() => {
    if (email !== undefined) {
      formStore.setFieldValue('email', email);
    }
  }, [email]);

  React.useEffect(() => {
    if (phone !== undefined) {
      formStore.setFieldValue('phone', phone);
    }
  }, [phone]);

  // Функция для установки значения извне
  const setFieldValue = (fieldName: string, value: any) => {
    setValue(fieldName, value);
    formStore.setFieldValue(fieldName, value);
  };

  return {
    ...form,
    storeState,
    setFieldValue
  };
};
