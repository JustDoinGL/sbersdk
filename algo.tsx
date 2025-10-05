// types.ts
export type StepConfig = {
  id: string;
  name: string;
  fields: (keyof FormData)[];
  schema: z.ZodSchema;
};

export type FormData = {
  title: string | null;
  email: string | null;
  name: string | null;
  age: number | null;
  description: string | null;
  category: string | null;
};

// schemas.ts
import { z } from 'zod';

const createFieldSchema = <T extends z.ZodType>(schema: T) => 
  z.union([z.null(), schema]).refine(
    (val) => val !== null && schema.safeParse(val).success,
    { message: "Поле обязательно для заполнения" }
  );

export const Step1Schema = z.object({
  title: createFieldSchema(z.string().min(1, "Название обязательно")),
  email: createFieldSchema(z.string().email("Некорректный email")),
});

export const Step2Schema = z.object({
  name: createFieldSchema(z.string().min(2, "Имя должно содержать минимум 2 символа")),
  age: createFieldSchema(z.number().min(18, "Возраст должен быть от 18 лет")),
});

export const Step3Schema = z.object({
  description: createFieldSchema(z.string().min(10, "Описание должно содержать минимум 10 символов")),
  category: createFieldSchema(z.string().min(1, "Выберите категорию")),
});

export const FormSchema = Step1Schema.merge(Step2Schema).merge(Step3Schema);


// hooks/useMultiStepForm.ts
import { useCallback, useMemo } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormData, FormSchema, StepConfig } from '../types';

export const useMultiStepForm = (steps: StepConfig[], initialStep = 0) => {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: null,
      email: null,
      name: null,
      age: null,
      description: null,
      category: null,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const { watch, formState: { dirtyFields } } = form;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const currentStepConfig = steps[currentStep];

  // Оптимизированное отслеживание только нужных полей
  const currentStepValues = watch(currentStepConfig.fields);

  // Мемоизированная проверка валидности шага
  const isCurrentStepValid = useMemo(() => {
    try {
      currentStepConfig.schema.parse(currentStepValues);
      return true;
    } catch {
      return false;
    }
  }, [currentStepValues, currentStepConfig.schema]);

  // Проверка, были ли изменены поля текущего шага
  const isCurrentStepDirty = useMemo(() =>
    currentStepConfig.fields.every(field => 
      dirtyFields[field as keyof FormData]
    ), [dirtyFields, currentStepConfig.fields]
  );

  const isNextDisabled = !isCurrentStepValid || !isCurrentStepDirty;

  const nextStep = useCallback(async () => {
    const isValid = await form.trigger(currentStepConfig.fields as any);
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [form, currentStepConfig.fields, currentStep, steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  }, [steps.length]);

  return {
    ...form,
    currentStep,
    currentStepConfig,
    isNextDisabled,
    steps,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
  };
};


// components/Step1.tsx
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';

interface StepProps {
  form: UseFormReturn<FormData>;
}

export const Step1: React.FC<StepProps> = ({ form }) => {
  const { register, formState: { errors } } = form;

  return (
    <div className="step-content">
      <h3>Основная информация</h3>
      
      <div className="field">
        <label>Название *</label>
        <input 
          {...register('title')} 
          placeholder="Введите название"
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title.message}</span>}
      </div>

      <div className="field">
        <label>Email *</label>
        <input 
          {...register('email')} 
          placeholder="Введите email"
          type="email"
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-message">{errors.email.message}</span>}
      </div>
    </div>
  );
};

// components/Step2.tsx
export const Step2: React.FC<StepProps> = ({ form }) => {
  const { register, formState: { errors } } = form;

  return (
    <div className="step-content">
      <h3>Детали</h3>
      
      <div className="field">
        <label>Имя *</label>
        <input 
          {...register('name')} 
          placeholder="Введите имя"
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name.message}</span>}
      </div>

      <div className="field">
        <label>Возраст *</label>
        <input 
          {...register('age', { valueAsNumber: true })} 
          placeholder="Введите возраст"
          type="number"
          className={errors.age ? 'error' : ''}
        />
        {errors.age && <span className="error-message">{errors.age.message}</span>}
      </div>
    </div>
  );
};

// components/Step3.tsx
export const Step3: React.FC<StepProps> = ({ form }) => {
  const { register, formState: { errors } } = form;

  return (
    <div className="step-content">
      <h3>Описание</h3>
      
      <div className="field">
        <label>Описание *</label>
        <textarea 
          {...register('description')} 
          placeholder="Введите описание (минимум 10 символов)"
          rows={4}
          className={errors.description ? 'error' : ''}
        />
        {errors.description && <span className="error-message">{errors.description.message}</span>}
      </div>

      <div className="field">
        <label>Категория *</label>
        <select 
          {...register('category')}
          className={errors.category ? 'error' : ''}
        >
          <option value="">Выберите категорию</option>
          <option value="tech">Технологии</option>
          <option value="business">Бизнес</option>
          <option value="education">Образование</option>
        </select>
        {errors.category && <span className="error-message">{errors.category.message}</span>}
      </div>
    </div>
  );
};

// components/MultiStepForm.tsx
import React from 'react';
import { useMultiStepForm } from '../hooks/useMultiStepForm';
import { Step1, Step2, Step3 } from './steps';
import { StepIndicator } from './StepIndicator';
import { FormActions } from './FormActions';
import { Step1Schema, Step2Schema, Step3Schema } from '../schemas';

const stepsConfig = [
  { 
    id: 'step1', 
    name: 'Основная информация', 
    fields: ['title', 'email'],
    schema: Step1Schema,
    component: Step1
  },
  { 
    id: 'step2', 
    name: 'Детали', 
    fields: ['name', 'age'],
    schema: Step2Schema,
    component: Step2
  },
  { 
    id: 'step3', 
    name: 'Описание', 
    fields: ['description', 'category'],
    schema: Step3Schema,
    component: Step3
  },
];

export const MultiStepForm: React.FC = () => {
  const form = useMultiStepForm(stepsConfig);
  const { currentStep, currentStepConfig, handleSubmit } = form;

  const CurrentStepComponent = stepsConfig[currentStep].component;

  const onSubmit = (data: FormData) => {
    console.log('Форма отправлена:', data);
    // Обработка успешной отправки
  };

  const onError = (errors: any) => {
    console.log('Ошибки формы:', errors);
  };

  return (
    <div className="multi-step-form">
      <StepIndicator 
        steps={stepsConfig} 
        currentStep={currentStep}
        onStepClick={form.goToStep}
      />

      <form onSubmit={handleSubmit(onSubmit, onError)} className="form-content">
        <CurrentStepComponent form={form} />
        
        <FormActions form={form} />
      </form>

      <FormDebugInfo form={form} />
    </div>
  );
};

// components/StepIndicator.tsx
import React from 'react';
import { StepConfig } from '../types';

interface StepIndicatorProps {
  steps: StepConfig[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick
}) => (
  <div className="step-indicator">
    {steps.map((step, index) => (
      <div
        key={step.id}
        className={`step ${index === currentStep ? 'active' : ''} ${
          index < currentStep ? 'completed' : ''
        } ${index > currentStep ? 'upcoming' : ''}`}
        onClick={() => index <= currentStep && onStepClick(index)}
      >
        <div className="step-number">{index + 1}</div>
        <div className="step-name">{step.name}</div>
        {index < steps.length - 1 && <div className="step-connector" />}
      </div>
    ))}
  </div>
);

// components/FormActions.tsx
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';

interface FormActionsProps {
  form: UseFormReturn<FormData> & {
    currentStep: number;
    isNextDisabled: boolean;
    isFirstStep: boolean;
    isLastStep: boolean;
    prevStep: () => void;
    nextStep: () => void;
  };
}

export const FormActions: React.FC<FormActionsProps> = ({ form }) => (
  <div className="form-actions">
    <button
      type="button"
      onClick={form.prevStep}
      disabled={form.isFirstStep}
      className="btn btn-secondary"
    >
      Назад
    </button>

    {form.isLastStep ? (
      <button type="submit" className="btn btn-primary">
        Отправить
      </button>
    ) : (
      <button
        type="button"
        onClick={form.nextStep}
        disabled={form.isNextDisabled}
        className="btn btn-primary"
      >
        Далее
      </button>
    )}
  </div>
);



