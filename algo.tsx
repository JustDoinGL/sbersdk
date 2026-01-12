import { useState, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productForm, ProductForm, productSteps } from "./schema";

export const Products = () => {
  // Динамически определяем первый и последний шаг
  const stepKeys = Object.keys(productSteps).map(Number).sort((a, b) => a - b);
  const firstStep = stepKeys[0];
  const lastStep = stepKeys[stepKeys.length - 1];
  
  const [currentStep, setCurrentStep] = useState<number>(firstStep);

  const methods = useForm<ProductForm>({
    resolver: zodResolver(productForm),
    mode: "onChange",
  });

  const { handleSubmit, trigger, formState } = methods;

  const onSubmit = async (formData: ProductForm) => {
    console.log("Все данные формы:", formData);
    // Отправка данных
  };

  const handleNext = async () => {
    const currentStepFields = productSteps[currentStep]?.fields;

    if (!currentStepFields) {
      console.error(`Шаг ${currentStep} не найден`);
      return;
    }

    console.log(`Валидируем поля шага ${currentStep}:`, currentStepFields);

    const isValid = await trigger(currentStepFields);

    if (isValid) {
      console.log("Шаг валиден, переходим дальше");

      if (currentStep < lastStep) {
        setCurrentStep((prev) => prev + 1);
      } else {
        // Последний шаг - отправляем форму
        handleSubmit(onSubmit)();
      }
    } else {
      console.log("Шаг невалиден, ошибки:", formState.errors);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, firstStep));
  };

  const handleJumpToStep = (step: number) => {
    if (step >= firstStep && step <= lastStep) {
      setCurrentStep(step);
    }
  };

  const CurrentStepComponent = productSteps[currentStep]?.Component;

  // Прогресс в процентах
  const progressPercentage = useMemo(() => {
    const totalSteps = lastStep - firstStep + 1;
    const currentProgress = currentStep - firstStep;
    return Math.round((currentProgress / totalSteps) * 100);
  }, [currentStep, firstStep, lastStep]);

  // Проверяем, можно ли перейти на следующий шаг
  const isNextDisabled = currentStep === lastStep;

  return (
    <FormProvider {...methods}>
      <div className="product-form-container">
        {/* Прогресс-бар */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
          <div className="step-indicator">
            Шаг {currentStep} из {lastStep}
          </div>
        </div>

        {/* Текущий шаг формы */}
        {CurrentStepComponent ? (
          <CurrentStepComponent />
        ) : (
          <div>Компонент для шага {currentStep} не найден</div>
        )}

        {/* Навигация */}
        <div className="navigation-buttons">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === firstStep}
            className="nav-button prev-button"
          >
            Назад
          </button>

          {/* Быстрая навигация по шагам (опционально) */}
          <div className="step-jump">
            {stepKeys.map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => handleJumpToStep(step)}
                className={`step-dot ${step === currentStep ? 'active' : ''}`}
                title={`Перейти к шагу ${step}`}
              />
            ))}
          </div>

          {isNextDisabled ? (
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="nav-button submit-button"
            >
              Отправить
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="nav-button next-button"
            >
              Далее
            </button>
          )}
        </div>
      </div>
    </FormProvider>
  );
};