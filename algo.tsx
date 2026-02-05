import { useSyncExternalStore } from 'react';
import { useForm } from 'react-hook-form';

// 1. Типы (для TypeScript)
/*
interface StepConfig {
  id: number;
  component: React.ComponentType<any>;
  formKeys: string[]; // Ключи для react-hook-form
  buttons: Array<{
    id: string;
    label: string;
    action?: () => void;
    validate?: boolean; // Нужна ли валидация перед действием
  }>;
  title?: string;
  description?: string;
}
*/

// 2. Конфигурация хранилища с react-hook-form
function createWizardStore(initialSteps) {
  let currentStep = 0;
  let steps = initialSteps;
  let formData = {};
  let listeners = [];
  
  // Инициализируем formData для всех ключей
  steps.forEach(step => {
    step.formKeys.forEach(key => {
      formData[key] = '';
    });
  });
  
  const store = {
    getSnapshot() {
      const currentStepConfig = steps[currentStep];
      return {
        currentStep,
        stepConfig: currentStepConfig,
        allSteps: steps,
        // Триггеры только для текущего шага
        triggers: currentStepConfig.formKeys.reduce((acc, key) => {
          acc[key] = formData[key];
          return acc;
        }, {}),
        // Все данные формы
        allFormData: { ...formData },
        // Проверка валидности текущего шага
        isStepValid: () => {
          return currentStepConfig.formKeys.every(key => 
            formData[key] && formData[key].toString().trim() !== ''
          );
        }
      };
    },
    
    subscribe(listener) {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter(l => l !== listener);
      };
    },
    
    updateFormData(data) {
      formData = { ...formData, ...data };
      this.notify();
    },
    
    setStep(stepIndex) {
      if (stepIndex >= 0 && stepIndex < steps.length) {
        currentStep = stepIndex;
        this.notify();
      }
    },
    
    nextStep() {
      if (currentStep < steps.length - 1) {
        currentStep++;
        this.notify();
        return true;
      }
      return false;
    },
    
    prevStep() {
      if (currentStep > 0) {
        currentStep--;
        this.notify();
        return true;
      }
      return false;
    },
    
    handleButtonAction(buttonId, formMethods) {
      const config = steps[currentStep];
      const button = config.buttons.find(b => b.id === buttonId);
      
      if (!button) return;
      
      // Если кнопка требует валидации
      if (button.validate && formMethods) {
        // Валидируем только поля текущего шага
        const isValid = config.formKeys.every(key => {
          const value = formMethods.getValues(key);
          return value && value.toString().trim() !== '';
        });
        
        if (!isValid) {
          formMethods.trigger(config.formKeys);
          return;
        }
      }
      
      // Выполняем кастомное действие или стандартное
      if (button.action) {
        button.action(formData);
      } else {
        switch(buttonId) {
          case 'next':
            this.nextStep();
            break;
          case 'back':
            this.prevStep();
            break;
          case 'submit':
            console.log('Отправка формы:', formData);
            break;
        }
      }
    },
    
    notify() {
      listeners.forEach(listener => listener());
    }
  };
  
  return store;
}

// 3. Кастомный хук для интеграции
function useWizardWithForm(stepsConfig) {
  const [store] = React.useState(() => createWizardStore(stepsConfig));
  
  // React Hook Form
  const formMethods = useForm({
    mode: 'onChange',
    defaultValues: stepsConfig.reduce((acc, step) => {
      step.formKeys.forEach(key => {
        acc[key] = '';
      });
      return acc;
    }, {})
  });
  
  // Подписываемся на изменения формы
  const formValues = formMethods.watch();
  React.useEffect(() => {
    store.updateFormData(formValues);
  }, [formValues, store]);
  
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot
  );
  
  return {
    ...snapshot,
    formMethods,
    store,
    // Вспомогательные методы
    nextStep: () => {
      if (snapshot.isStepValid()) {
        store.nextStep();
      } else {
        formMethods.trigger(snapshot.stepConfig.formKeys);
      }
    },
    prevStep: store.prevStep,
    goToStep: store.setStep,
    handleButton: (buttonId) => {
      store.handleButtonAction(buttonId, formMethods);
    }
  };
}

// 4. Пример конфигурации
const registrationSteps = [
  {
    id: 0,
    component: PersonalInfoStep,
    formKeys: ['firstName', 'lastName', 'email'],
    buttons: [
      { id: 'next', label: 'Далее', validate: true }
    ],
    title: 'Личная информация',
    description: 'Заполните основные данные'
  },
  {
    id: 1,
    component: AddressStep,
    formKeys: ['address', 'city', 'postalCode', 'country'],
    buttons: [
      { id: 'back', label: 'Назад' },
      { id: 'next', label: 'Продолжить', validate: true }
    ],
    title: 'Адрес доставки'
  },
  {
    id: 2,
    component: PaymentStep,
    formKeys: ['cardNumber', 'expiry', 'cvc', 'cardholder'],
    buttons: [
      { id: 'back', label: 'Назад' },
      { id: 'submit', label: 'Оформить заказ', validate: true }
    ],
    title: 'Оплата'
  }
];

// 5. Главный компонент Wizard
function RegistrationWizard() {
  const { 
    currentStep, 
    stepConfig, 
    triggers,
    formMethods,
    handleButton,
    isStepValid 
  } = useWizardWithForm(registrationSteps);
  
  const CurrentStepComponent = stepConfig.component;
  
  return (
    <div className="wizard">
      {/* Прогресс бар */}
      <div className="progress">
        {registrationSteps.map((step, index) => (
          <div 
            key={step.id} 
            className={`step ${index === currentStep ? 'active' : ''}`}
            onClick={() => isStepValid() && store.setStep(index)}
          >
            {index + 1}
          </div>
        ))}
      </div>
      
      {/* Заголовок шага */}
      <h2>{stepConfig.title}</h2>
      {stepConfig.description && <p>{stepConfig.description}</p>}
      
      {/* Форма */}
      <form>
        <CurrentStepComponent 
          formMethods={formMethods}
          triggers={triggers}
        />
      </form>
      
      {/* Кнопки */}
      <div className="wizard-buttons">
        {stepConfig.buttons.map(button => (
          <button
            key={button.id}
            type="button"
            onClick={() => handleButton(button.id)}
            className={button.id}
            disabled={button.validate && !isStepValid()}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// 6. Пример компонента шага с react-hook-form
function PersonalInfoStep({ formMethods, triggers }) {
  const { register, formState: { errors } } = formMethods;
  
  return (
    <div className="step-content">
      <div className="form-group">
        <label>Имя *</label>
        <input
          {...register('firstName', { 
            required: 'Имя обязательно' 
          })}
          className={errors.firstName ? 'error' : ''}
        />
        {errors.firstName && (
          <span className="error-message">{errors.firstName.message}</span>
        )}
      </div>
      
      <div className="form-group">
        <label>Фамилия</label>
        <input {...register('lastName')} />
      </div>
      
      <div className="form-group">
        <label>Email *</label>
        <input
          {...register('email', {
            required: 'Email обязателен',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Неверный формат email'
            }
          })}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && (
          <span className="error-message">{errors.email.message}</span>
        )}
      </div>
      
      {/* Отладочная информация */}
      <div className="debug-info">
        <p>Текущие значения: {JSON.stringify(triggers)}</p>
        <p>Ключи валидации: {JSON.stringify(Object.keys(triggers))}</p>
      </div>
    </div>
  );
}

// 7. Альтернатива: упрощенный хук
export function useWizardSteps(stepsConfig) {
  const store = React.useMemo(() => createWizardStore(stepsConfig), [stepsConfig]);
  
  const { 
    currentStep, 
    stepConfig, 
    triggers,
    allFormData,
    isStepValid 
  } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot
  );
  
  return {
    // Текущее состояние
    currentStep,
    stepConfig,
    triggers,
    allFormData,
    isStepValid,
    
    // Методы
    setStep: store.setStep,
    nextStep: store.nextStep,
    prevStep: store.prevStep,
    updateFormData: store.updateFormData,
    handleButtonAction: store.handleButtonAction,
    
    // Интеграция с формой
    getFormConfig: () => ({
      defaultValues: stepsConfig.reduce((acc, step) => {
        step.formKeys.forEach(key => {
          acc[key] = allFormData[key] || '';
        });
        return acc;
      }, {})
    })
  };
}

// 8. Использование с useForm
function YourComponent() {
  const steps = [
    {
      component: Step1,
      formKeys: ['field1', 'field2'],
      buttons: [{ id: 'next', label: 'Далее' }]
    },
    // ... другие шаги
  ];
  
  const wizard = useWizardSteps(steps);
  const formMethods = useForm(wizard.getFormConfig());
  
  // Синхронизация формы с хранилищем
  React.useEffect(() => {
    const subscription = formMethods.watch((values) => {
      wizard.updateFormData(values);
    });
    return () => subscription.unsubscribe();
  }, [formMethods, wizard]);
  
  const CurrentStep = wizard.stepConfig.component;
  
  return (
    <form>
      <CurrentStep 
        formMethods={formMethods}
        triggers={wizard.triggers}
      />
      
      {wizard.stepConfig.buttons.map(button => (
        <button
          key={button.id}
          onClick={() => wizard.handleButtonAction(button.id, formMethods)}
        >
          {button.label}
        </button>
      ))}
    </form>
  );
}
