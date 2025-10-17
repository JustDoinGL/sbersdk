import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRef, useEffect } from 'react';

// Схема валидации - каждый элемент как number, затем преобразуем в строку
const smsCodeSchema = z.object({
  digits: z.array(
    z.number({ 
      required_error: "Все поля должны быть заполнены",
      invalid_type_error: "Должна быть цифра"
    }).min(0).max(9)
  ).length(6, "Код должен содержать 6 цифр")
}).transform((data) => ({
  ...data,
  fullCode: data.digits.join('')
})).refine(
  (data) => /^\d{6}$/.test(data.fullCode),
  {
    message: "Код должен содержать ровно 6 цифр",
    path: ["digits"]
  }
);

type SmsCodeFormValues = {
  digits: number[];
  fullCode?: string;
};

const SmsCodeInputWithReactHookForm = () => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
    clearErrors,
    trigger,
    watch
  } = useForm<SmsCodeFormValues>({
    resolver: zodResolver(smsCodeSchema),
    defaultValues: {
      digits: ['', '', '', '', '', ''].map(() => NaN), // Начальные значения как NaN
    },
    mode: 'onChange'
  });

  const { fields } = useFieldArray({
    control,
    name: 'digits'
  });

  const digits = watch('digits');

  // Фокусируем первый инпут при монтировании
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleDigitChange = async (index: number, value: string) => {
    // Разрешаем только цифры 0-9
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const numericValue = value === '' ? NaN : parseInt(value, 10);
    
    // Устанавливаем значение
    setValue(`digits.${index}`, numericValue);
    
    // Очищаем ошибки при изменении
    clearErrors('digits');

    // Автоматически переходим к следующему инпуту при вводе цифры
    if (value && index < 5) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 10);
    }

    // Триггерим валидацию после изменения
    await trigger('digits');
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Обработка Backspace
    if (e.key === 'Backspace') {
      if (isNaN(digits[index]) && index > 0) {
        // Если текущий инпут пустой и нажали Backspace - переходим к предыдущему
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
        }, 10);
      } else if (!isNaN(digits[index])) {
        // Если есть значение - очищаем его
        setValue(`digits.${index}`, NaN);
        clearErrors('digits');
      }
    }

    // Обработка стрелок
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Обработка Delete
    if (e.key === 'Delete') {
      setValue(`digits.${index}`, NaN);
      clearErrors('digits');
    }
  };

  const handlePaste = (e: React.ClipboardEvent, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    if (/^\d+$/.test(pastedData)) {
      const digitsArray = pastedData.split('').slice(0, 6);
      
      // Заполняем все инпуты скопированными цифрами
      digitsArray.forEach((digit, digitIndex) => {
        if (digitIndex < 6) {
          setValue(`digits.${digitIndex}`, parseInt(digit, 10));
        }
      });
      
      // Фокусируем последний заполненный инпут
      const lastFilledIndex = Math.min(digitsArray.length - 1, 5);
      setTimeout(() => {
        inputRefs.current[lastFilledIndex]?.focus();
      }, 10);
      
      clearErrors('digits');
      trigger('digits');
    }
  };

  const onSubmit = async (data: SmsCodeFormValues) => {
    console.log('Полные данные формы:', data);
    
    try {
      // Валидируем полный код через схему
      const validatedData = smsCodeSchema.parse({
        digits: data.digits
      });
      
      console.log('Валидированный SMS код:', validatedData.fullCode);
      
      // Здесь логика отправки кода на сервер
      // await api.verifySmsCode(validatedData.fullCode);
      
      // Имитация успешной отправки
      alert(`Код ${validatedData.fullCode} успешно отправлен!`);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Ошибка валидации:', error.errors);
        setError('root', { 
          message: 'Неверный код. Проверьте правильность и попробуйте ещё раз' 
        });
        
        // Находим первый некорректный инпут и фокусируем его
        const firstInvalidIndex = data.digits.findIndex(digit => isNaN(digit));
        if (firstInvalidIndex !== -1 && inputRefs.current[firstInvalidIndex]) {
          inputRefs.current[firstInvalidIndex]?.focus();
        }
      }
    }
  };

  const handleResendCode = () => {
    // Сбрасываем форму
    setValue('digits', [NaN, NaN, NaN, NaN, NaN, NaN]);
    clearErrors();
    
    // Фокусируем первый инпут
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 10);
    
    console.log('Запрос на повторную отправку кода');
  };

  const allDigitsFilled = digits?.every(digit => !isNaN(digit));

  return (
    <div className="flex flex-col items-center space-y-6 p-6 max-w-sm mx-auto">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Введите СМС-код</h2>
        <p className="text-gray-600 mb-1">Отправили на +7 913 000-00-00</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        {/* Контейнер для инпутов */}
        <div className="flex space-x-2 mb-4 justify-center">
          {fields.map((field, index) => (
            <Controller
              key={field.id}
              control={control}
              name={`digits.${index}`}
              render={({ field: controllerField }) => (
                <input
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={isNaN(controllerField.value) ? '' : controllerField.value.toString()}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => handlePaste(e, index)}
                  className={`
                    w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg
                    focus:outline-none focus:border-blue-500 transition-colors
                    ${errors.digits ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                    ${!isNaN(controllerField.value) ? 'bg-blue-50 border-blue-300' : ''}
                    ${errors.digits && isNaN(controllerField.value) ? 'border-red-500 shake' : ''}
                  `}
                />
              )}
            />
          ))}
        </div>

        {/* Сообщения об ошибках */}
        {errors.digits && (
          <div className="text-red-500 text-center text-sm mb-2">
            {errors.digits.message || "Все поля должны быть заполнены цифрами"}
          </div>
        )}

        {errors.root && (
          <div className="text-red-500 text-center text-sm mb-2">
            {errors.root.message}
          </div>
        )}

        {/* Информационное сообщение */}
        <div className="text-xs text-gray-500 text-center mb-4">
          Цифры из смс – простая электронная подпись.
          <br />
          После ввода Акт считается подписанным
        </div>

        {/* Кнопки действий */}
        <div className="flex flex-col space-y-3 w-full">
          <button
            type="submit"
            disabled={isSubmitting || !allDigitsFilled}
            className={`
              w-full py-3 px-4 rounded-lg font-medium transition-colors
              ${isSubmitting || !allDigitsFilled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
          >
            {isSubmitting ? 'Проверка...' : 'Подписать акт'}
          </button>

          <button
            type="button"
            onClick={handleResendCode}
            disabled={isSubmitting}
            className="text-blue-500 hover:text-blue-700 disabled:text-gray-400 transition-colors"
          >
            Отправить новый через 46 сек.
          </button>

          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            Отменить
          </button>

          <button
            type="button"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Send your admins a reminder
          </button>
        </div>
      </form>

      {/* Отладочная информация */}
      <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
        <div>Текущие цифры: {digits?.map(d => isNaN(d) ? '_' : d).join(' ')}</div>
        <div>Полный код: {digits?.every(d => !isNaN(d)) ? digits.join('') : 'Не заполнен'}</div>
        <div>Все поля заполнены: {allDigitsFilled ? 'Да' : 'Нет'}</div>
      </div>
    </div>
  );
};

export default SmsCodeInputWithReactHookForm;