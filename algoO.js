import { useSyncExternalStore } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';

// 1. Создаем внешний store
const phoneStore = {
  value: '',
  listeners: new Set(),
  
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  
  getSnapshot() {
    return this.value;
  },
  
  setValue(newValue) {
    if (this.value !== newValue) {
      this.value = newValue;
      this.listeners.forEach(listener => listener());
    }
  }
};

// 2. Главный компонент формы
export default function SyncPhoneForm() {
  const methods = useForm({
    defaultValues: {
      phonenumber1: '',
      phonenumber2: ''
    }
  });

  const { control } = methods;

  // 3. Подписываемся на изменения store и синхронизируем с формой
  const storeValue = useSyncExternalStore(
    phoneStore.subscribe,
    phoneStore.getSnapshot
  );

  // 4. Синхронизация store → форма
  React.useEffect(() => {
    if (storeValue) {
      methods.setValue('phonenumber1', storeValue, { shouldValidate: true });
      methods.setValue('phonenumber2', storeValue, { shouldValidate: true });
    }
  }, [storeValue, methods]);

  return (
    <FormProvider {...methods}>
      <form>
        <PhoneField name="phonenumber1" />
        <PhoneField name="phonenumber2" />
        
        {/* Для отладки */}
        <div style={{ marginTop: '20px' }}>
          <strong>Store value:</strong> {storeValue}
        </div>
      </form>
    </FormProvider>
  );
}

// 5. Компонент поля ввода
function PhoneField({ name }) {
  const { register, setValue } = useFormContext();

  // 6. Обработчик изменения - форма → store
  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Обновляем store
    phoneStore.setValue(newValue);
    
    // НЕ вызываем setValue здесь - это сделает эффект выше
  };

  return (
    <div style={{ margin: '10px 0' }}>
      <label style={{ display: 'block', marginBottom: '5px' }}>
        {name}:
      </label>
      <input
        type="text"
        {...register(name, {
          onChange: handleChange
        })}
        style={{ padding: '8px', width: '200px' }}
      />
    </div>
  );
}