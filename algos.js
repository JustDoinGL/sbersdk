import { useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import styles from "../sms_step.module.css";
import { Input, Text } from "@sg/ukkit";
import cn from "classnames";

const INPUT_IDS = ["digit-0", "digit-1", "digit-2", "digit-3", "digit-4", "digit-5"];

type Props = {
  handleNextStep: () => void;
};

type FormData = {
  digits: string[];
};

export const SmsCodeForm: React.FC<Props> = ({ handleNextStep }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    trigger,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      digits: ["", "", "", "", "", ""]
    },
    mode: "onChange"
  });

  const digits = watch("digits");

  const handleSendCode = async (code: string) => {
    console.log('Sending code:', code);
    
    if (code === "111111") {
      handleNextStep();
    } else {
      setError("root", { 
        message: "Неверный код. Проверьте правильность и попробуйте ещё раз" 
      });
    }
  };

  const onSubmit = (data: FormData) => {
    const code = data.digits.join("");
    console.log('Form submitted with code:', code);
    handleSendCode(code);
  };

  // Автоматическая отправка когда все поля заполнены
  useEffect(() => {
    const code = digits.join("");
    if (code.length === 6 && /^\d+$/.test(code)) {
      handleSendCode(code);
    }
  }, [digits]);

  const handlePaste = useCallback((event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    clearErrors("root");
    
    const pastedText = event.clipboardData.getData("text/plain").trim();
    const pastedDigits = pastedText.replace(/\D/g, "").split("").slice(0, 6);

    if (pastedDigits.length > 0) {
      // Сначала очищаем все поля
      for (let i = 0; i < 6; i++) {
        setValue(`digits.${i}`, "");
      }
      
      // Заполняем вставленными цифрами
      pastedDigits.forEach((digit, index) => {
        setValue(`digits.${index}`, digit, { shouldValidate: true });
      });

      const nextFocusIndex = Math.min(pastedDigits.length, 5);
      setTimeout(() => {
        inputRefs.current[nextFocusIndex]?.focus();
      }, 0);
    }
  }, [setValue, clearErrors]);

  const handleChange = useCallback((index: number, value: string) => {
    clearErrors("root");
    
    // Оставляем только цифры и берем последнюю
    const digit = value.replace(/\D/g, "").slice(-1);
    
    setValue(`digits.${index}`, digit, { shouldValidate: true });
    
    // Если ввели цифру и есть следующее поле - фокусируемся на нем
    if (digit && index < 5) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    }
    
    // Если стерли цифру и есть предыдущее поле - фокусируемся на нем
    if (!digit && index > 0) {
      setTimeout(() => {
        inputRefs.current[index - 1]?.focus();
      }, 0);
    }
  }, [setValue, clearErrors]);

  const handleKeyDown = useCallback((index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    clearErrors("root");

    if (event.key === "Backspace") {
      // Если поле пустое и не первое - переходим к предыдущему
      if (!digits[index] && index > 0) {
        setValue(`digits.${index - 1}`, "", { shouldValidate: true });
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
        }, 0);
        event.preventDefault();
      }
      // Если в поле есть значение - очищаем его
      else if (digits[index]) {
        setValue(`digits.${index}`, "", { shouldValidate: true });
        event.preventDefault();
      }
    } 
    else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } 
    else if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
    // Обработка ввода цифр
    else if (/\d/.test(event.key)) {
      // Если поле уже заполнено - заменяем значение
      if (digits[index]) {
        setValue(`digits.${index}`, event.key, { shouldValidate: true });
        if (index < 5) {
          setTimeout(() => {
            inputRefs.current[index + 1]?.focus();
          }, 0);
        }
        event.preventDefault();
      }
    }
  }, [digits, setValue, clearErrors]);

  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.select();
  }, []);

  const handleClick = useCallback((index: number, event: React.MouseEvent<HTMLInputElement>) => {
    if (digits[index]) {
      event.currentTarget.select();
    }
  }, [digits]);

  const setInputRef = useCallback((index: number) => (element: HTMLInputElement | null) => {
    inputRefs.current[index] = element;
  }, []);

  // Регистрируем поля с правильной конфигурацией
  const registerField = useCallback((index: number) => {
    const { ref, ...rest } = register(`digits.${index}`, {
      required: false, // Не делаем обязательным, так как валидируем всю форму
      pattern: /^\d?$/ // Разрешаем пустую строку или одну цифру
    });
    
    return {
      ...rest,
      value: digits[index] || "", // Обеспечиваем что value всегда строка
      ref: (element: HTMLInputElement | null) => {
        ref(element);
        setInputRef(index)(element);
      }
    };
  }, [register, digits, setInputRef]);

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        {INPUT_IDS.map((id, index) => (
          <Input
            key={id}
            {...registerField(index)}
            autoFocus={index === 0}
            placeholder="0"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            onPaste={handlePaste}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleChange(index, e.target.value)
            }
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => 
              handleKeyDown(index, event)
            }
            onFocus={handleFocus}
            onClick={(event: React.MouseEvent<HTMLInputElement>) => 
              handleClick(index, event)
            }
            autoComplete="one-time-code"
            style={{ width: "52px", height: "68px", padding: "22px 20px" }}
            hasError={!!errors.root}
          />
        ))}
      </form>
      
      {errors.root && (
        <div className={cn(styles.error, styles.errorVisible)}>
          <Text font="caption_1" color="#FF0239" align="center">
            {errors.root.message}
          </Text>
        </div>
      )}
    </>
  );
};