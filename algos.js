import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useSyncExternalStore } from 'react';

// Типы для формы
interface FormData {
  field1: string;
  field2: string;
}

// Внешнее хранилище (Event Emitter)
class ExternalStore {
  private listeners: (() => void)[] = [];
  private data: FormData = { field1: '', field2: '' };

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getSnapshot() {
    return this.data;
  }

  updateField(field: keyof FormData, value: string) {
    this.data[field] = value;
    this.emitChange();
  }

  updateAll(data: FormData) {
    this.data = { ...data };
    this.emitChange();
  }

  private emitChange() {
    this.listeners.forEach(listener => listener());
  }
}

// Создаем экземпляр хранилища
const externalStore = new ExternalStore();

const ConnectedForm: React.FC = () => {
  const { register, control, setValue, getValues } = useForm<FormData>({
    defaultValues: {
      field1: '',
      field2: '',
    },
  });

  // Синхронизация с внешним хранилищем
  const externalData = useSyncExternalStore(
    externalStore.subscribe,
    externalStore.getSnapshot
  );

  // Следим за изменениями полей в форме
  const field1Value = useWatch({ control, name: 'field1' });
  const field2Value = useWatch({ control, name: 'field2' });

  // Синхронизация из формы во внешнее хранилище
  useEffect(() => {
    externalStore.updateAll(getValues());
  }, [field1Value, field2Value, getValues]);

  // Синхронизация из внешнего хранилища в форму
  useEffect(() => {
    const currentValues = getValues();
    
    if (externalData.field1 !== currentValues.field1) {
      setValue('field1', externalData.field1);
    }
    
    if (externalData.field2 !== currentValues.field2) {
      setValue('field2', externalData.field2);
    }
  }, [externalData, setValue, getValues]);

  // Обработчики для прямого обновления хранилища
  const handleField1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    externalStore.updateField('field1', value);
  };

  const handleField2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    externalStore.updateField('field2', value);
  };

  // Функция для имитации внешнего изменения
  const simulateExternalChange = () => {
    externalStore.updateField('field1', `External: ${Date.now()}`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>Связанные поля с внешним хранилищем</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Поле 1: </label>
        <input
          {...register('field1')}
          onChange={handleField1Change}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Поле 2: </label>
        <input
          {...register('field2')}
          onChange={handleField2Change}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <button 
          type="button" 
          onClick={simulateExternalChange}
          style={{ padding: '8px 16px' }}
        >
          Имитировать внешнее изменение
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
        <h4>Текущие значения:</h4>
        <p>Field 1: {field1Value}</p>
        <p>Field 2: {field2Value}</p>
        <p>External Field 1: {externalData.field1}</p>
        <p>External Field 2: {externalData.field2}</p>
      </div>
    </div>
  );
};

export default ConnectedForm;