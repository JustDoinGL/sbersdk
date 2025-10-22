// Вспомогательные функции
const sanitizeDigit = (value: string): string => {
  return value.replace(/\D/g, "").slice(-1);
};

const extractDigits = (text: string): string[] => {
  return text.replace(/\D/g, "").split("").slice(0, 6);
};

const validateGlobalInput = (value: string): boolean => {
  return /^\d+$/.test(value);
};

const showGlobalError = (message: string) => {
  form.setError("root", { message });
};

const clearGlobalError = () => {
  form.clearErrors("root");
};

const setDigitValue = (index: number, value: string, options = {}) => {
  form.setValue(`digits.${index}`, value, { shouldValidate: true, ...options });
};

const focusInput = (index: number) => {
  inputRefs.current[index]?.focus();
};

// Обновленные обработчики
const handleSendCode = async () => {
  // ... существующий код
};

const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
  event.preventDefault();
  clearGlobalError();
  
  const pastedText = event.clipboardData.getData("text/plain").trim();
  
  // Глобальная проверка на числа
  if (!validateGlobalInput(pastedText)) {
    showGlobalError("Вводите только числа");
    return;
  }
  
  const pastedDigits = extractDigits(pastedText);
  
  if (pastedDigits.length > 0) {
    form.reset();
    pastedDigits.forEach((digit, index) => {
      setDigitValue(index, digit);
    });
    
    const nextFocusIndex = Math.min(pastedDigits.length, 5);
    focusInput(nextFocusIndex);
  }
  
  handleSendCode();
};

const handleChange = (index: number, value: string) => {
  clearGlobalError();
  
  // Глобальная проверка на числа
  if (value && !validateGlobalInput(value)) {
    showGlobalError("Вводите только числа");
    return;
  }
  
  const digit = sanitizeDigit(value);
  setDigitValue(index, digit);

  // Если ввели цифру и есть следующее поле - фокусируемся на нем
  if (digit && index < 5) {
    focusInput(index + 1);
  }

  // Если стерли цифру и есть предыдущее поле - фокусируемся на нем
  if (!digit && index > 0) {
    focusInput(index - 1);
  }

  handleSendCode();
};

const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
  clearGlobalError();
  const digits = form.getValues("digits");

  if (event.key === "Backspace") {
    // Если поле пустое и не первое - переходим к предыдущему
    if (!digits[index] && index > 0) {
      setDigitValue(index - 1, "");
      focusInput(index - 1);
      event.preventDefault();
    }
    // Если в поле есть значение - очищаем его
    else if (digits[index]) {
      setDigitValue(index, "");
      event.preventDefault();
    }
  }
  else if (event.key === "ArrowLeft" && index > 0) {
    event.preventDefault();
    focusInput(index - 1);
  }
  else if (event.key === "ArrowRight" && index < 5) {
    event.preventDefault();
    focusInput(index + 1);
  }
  // Обработка ввода цифр
  else if (/\d/.test(event.key)) {
    // Глобальная проверка на числа
    if (!validateGlobalInput(event.key)) {
      showGlobalError("Вводите только числа");
      event.preventDefault();
      return;
    }
    
    // Если поле уже заполнено - заменяем значение
    if (digits[index]) {
      setDigitValue(index, event.key);
      if (index < 5) {
        focusInput(index + 1);
      }
      event.preventDefault();
    }
  }

  handleSendCode();
};

const registerField = (index: number) => {
  const { ref, ...rest } = form.register(`digits.${index}`, { 
    required: true,
    pattern: /^\d$/,
  });

  return {
    ...rest,
    value: form.getValues(`digits.${index}`) || "",
    ref: (element: HTMLInputElement | null) => {
      ref(element);
      inputRefs.current[index] = element;
    }
  };
};