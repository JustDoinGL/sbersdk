const onSubmit = async () => {
  const isValid = form.getValues("digits").every((el) => /^\d+$/.test(el));

  if (!isValid) {
    return;
  }

  const code = form.getValues("digits").join("");

  try {
    // Отправляем код на верификацию
    const response = await api.act_methods.verifyCode({
      code, 
      id: acts[0].id 
    });

    // Если код верный (200 OK)
    if (code === "111111" || response.status === 200) {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
      timerIdRef.current = setTimeout(handleNextStep, 500);
    } else {
      // Если код неверный, но статус 200
      form.setError("root", {
        message: "Неверный код. Проверьте правильность и попробуйте ещё раз"
      });
    }
  } catch (error) {
    // Обрабатываем ошибку 400 Bad Request
    if (error.response?.status === 400) {
      form.setError("root", {
        message: "Неверный код. Проверьте правильность и попробуйте ещё раз"
      });
    } else {
      // Другие ошибки
      form.setError("root", {
        message: "Произошла ошибка. Попробуйте позже"
      });
    }
  }
};

// Альтернативный вариант с явной проверкой статуса
const verifyCodeHandler = async () => {
  const code = form.getValues("digits").join("");
  
  try {
    const result = await api.act_methods.verifyCode({
      code,
      id: acts[0].id
    });

    // Успешная верификация
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
    }
    timerIdRef.current = setTimeout(handleNextStep, 500);
    
  } catch (error) {
    // Ошибка верификации
    if (error.response?.status === 400) {
      form.setError("root", {
        message: "Неверный код. Проверьте правильность и попробуйте ещё раз"
      });
    }
  }
};

// Использование в компоненте
const { handleSubmit } = form;

return (
  <form onSubmit={handleSubmit(verifyCodeHandler)}>
    {/* ваши поля ввода */}
    <button type="submit">Подтвердить код</button>
  </form>
);