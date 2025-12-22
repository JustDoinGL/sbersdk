const ERROR_MESSAGES = {
  MAX_TRIES: "Для этого кода было использовано максимальное количество попыток. Пожалуйста, запросите новый код",
  CODE_EXPIRED: "Пожалуйста, предоставьте новый код через [CMC], так как действия текущего кода истекают через 5 мольбы",
  INVALID_CODE: "Неверный код. Проверьте правильность и попробуйте ещё раз",
};

try {
  await api.act_methods.verifyCode({
    code,
    id: act.id,
  });

  handleNextStep();
} catch (e) {
  if (e?.response?.data?.code?.[0]) {
    const errorCode = e.response.data.code[0];
    
    switch (errorCode) {
      case "Max tries for this code":
        form.setError("root", { message: ERROR_MESSAGES.MAX_TRIES });
        setBlock();
        break;
      
      case "Code is expired. Try to take new.":
        form.setError("root", { message: ERROR_MESSAGES.CODE_EXPIRED });
        break;
      
      case "Invalid sign code":
        form.setError("root", { message: ERROR_MESSAGES.INVALID_CODE });
        break;
      
      default:
        console.error("Неизвестная ошибка:", e);
        break;
    }
  } else {
    console.error("Ошибка без кода:", e);
  }
} finally {
  setIsLoading(false);
}