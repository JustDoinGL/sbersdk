import { useSyncExternalStore, useCallback } from 'react';

// 1. Конфигурация шагов (задаётся в начале)
const stepsConfig = [
  {
    id: 0,
    // Компонент для этого шага
    component: PersonalInfoStep,
    // Тексты кнопок для этого шага
    buttons: [
      { id: 'skip', label: 'Пропустить', variant: 'secondary' },
      { id: 'next', label: 'Далее', variant: 'primary' }
    ],
    // Ключи-триггеры для валидации/действий
    triggers: ['name', 'email', 'phone'],
    // Текст шага (опционально)
    text: 'Заполните личную информацию'
  },
  {
    id: 1,
    component: AddressStep,
    buttons: [
      { id: 'back', label: 'Назад' },
      { id: 'save', label: 'Сохранить черновик' },
      { id: 'next', label: 'Продолжить' }
    ],
    triggers: ['address', 'city', 'postalCode'],
    text: 'Укажите ваш адрес'
  },
  {
    id: 2,
    component: PaymentStep,
    buttons: [
      { id: 'back', label: 'Назад' },
      { id: 'pay', label: 'Оплатить сейчас' },
      { id: 'later', label: 'Оплатить позже' }
    ],
    triggers: ['cardNumber', 'expiry', 'cvc'],
    text: 'Введите платежные данные'
  },
  {
    id: 3,
    component: ConfirmationStep,
    buttons: [
      { id: 'back', label: 'Назад' },
      { id: 'confirm', label: 'Подтвердить заказ' }
    ],
    triggers: ['acceptTerms', 'newsletter'],
    text: 'Подтвердите введенные данные'
  }
];

// 2. Внешнее хранилище
let currentStep = 0;
let listeners = [];

// Дополнительное состояние для триггеров
let triggerValues = {};
stepsConfig.forEach(step => {
  step.triggers.forEach(trigger => {
    triggerValues[trigger] = '';
  });
});

const wizardStore = {
  getSnapshot() {
    const config = stepsConfig[currentStep];
    return {
      currentStep,
      stepConfig: config,
      allSteps: stepsConfig,
      // Динамические значения триггеров для текущего шага
      triggers: stepConfig.triggers.reduce((acc, trigger) => {
        acc[trigger] = triggerValues[trigger];
        return acc;
      }, {}),
      // Все значения триггеров (опционально)
      allTriggerValues: { ...triggerValues }
    };
  },
  
  subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
  
  goToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < stepsConfig.length) {
      currentStep = stepIndex;
      this.notify();
    }
  },
  
  nextStep() {
    if (currentStep < stepsConfig.length - 1) {
      currentStep++;
      this.notify();
    }
  },
  
  prevStep() {
    if (currentStep > 0) {
      currentStep--;
      this.notify();
    }
  },
  
  // Обновление значения триггера
  updateTrigger(triggerKey, value) {
    triggerValues[triggerKey] = value;
    this.notify();
  },
  
  // Выполнение действия кнопки
  handleButtonAction(buttonId) {
    const config = stepsConfig[currentStep];
    
    switch(buttonId) {
      case 'next':
        this.nextStep();
        break;
      case 'back':
        this.prevStep();
        break;
      case 'skip':
        // Пропустить валидацию текущих триггеров
        this.nextStep();
        break;
      case 'save':
        // Сохранение черновика
        console.log('Сохранение триггеров:', triggerValues);
        break;
      // ... другие обработчики
      default:
        console.log('Действие кнопки:', buttonId);
    }
  },
  
  notify() {
    listeners.forEach(listener => listener());
  }
};

// 3. Компонент StepComponent
function StepComponent({ config, triggers, onTriggerUpdate, onButtonClick }) {
  const { component: StepComponent } = config;
  
  return (
    <div className="step">
      <h2>{config.text}</h2>
      
      {/* Рендерим компонент шага */}
      <StepComponent 
        triggers={triggers}
        onUpdate={onTriggerUpdate}
      />
      
      {/* Кнопки навигации */}
      <div className="step-buttons">
        {config.buttons.map(button => (
          <button
            key={button.id}
            className={`btn ${button.variant || 'default'}`}
            onClick={() => onButtonClick(button.id)}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// 4. Главный компонент Wizard
function Wizard() {
  const { currentStep, stepConfig, triggers } = useSyncExternalStore(
    wizardStore.subscribe,
    wizardStore.getSnapshot
  );
  
  // Обработчик обновления триггеров
  const handleTriggerUpdate = useCallback((key, value) => {
    wizardStore.updateTrigger(key, value);
  }, []);
  
  // Обработчик клика по кнопке
  const handleButtonClick = useCallback((buttonId) => {
    wizardStore.handleButtonAction(buttonId);
  }, []);
  
  // Проверка готовности перехода к следующему шагу
  const isStepValid = () => {
    return stepConfig.triggers.every(trigger => 
      triggerValues[trigger] && triggerValues[trigger].trim() !== ''
    );
  };
  
  return (
    <div className="wizard-container">
      {/* Индикатор прогресса */}
      <div className="progress-indicator">
        {stepsConfig.map((step, index) => (
          <div
            key={step.id}
            className={`step-indicator ${index === currentStep ? 'active' : ''}`}
            onClick={() => wizardStore.goToStep(index)}
          >
            <span>Шаг {index + 1}</span>
            <div className="step-title">{step.text}</div>
          </div>
        ))}
      </div>
      
      {/* Текущий шаг */}
      <StepComponent
        config={stepConfig}
        triggers={triggers}
        onTriggerUpdate={handleTriggerUpdate}
        onButtonClick={handleButtonClick}
      />
      
      {/* Дополнительная информация */}
      <div className="step-info">
        <p>Текущие триггеры: {stepConfig.triggers.join(', ')}</p>
        <p>Шаг {currentStep + 1} из {stepsConfig.length}</p>
      </div>
    </div>
  );
}

// 5. Примеры компонентов шагов
function PersonalInfoStep({ triggers, onUpdate }) {
  return (
    <div className="step-content">
      <input
        type="text"
        placeholder="Имя"
        value={triggers.name || ''}
        onChange={(e) => onUpdate('name', e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={triggers.email || ''}
        onChange={(e) => onUpdate('email', e.target.value)}
      />
      <input
        type="tel"
        placeholder="Телефон"
        value={triggers.phone || ''}
        onChange={(e) => onUpdate('phone', e.target.value)}
      />
    </div>
  );
}

function AddressStep({ triggers, onUpdate }) {
  return (
    <div className="step-content">
      <textarea
        placeholder="Адрес"
        value={triggers.address || ''}
        onChange={(e) => onUpdate('address', e.target.value)}
      />
      {/* ... другие поля */}
    </div>
  );
}

// ... остальные компоненты шагов
