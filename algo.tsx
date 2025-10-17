const getTitle = (act: ActDto[], step: FormSteps, sign: Signing): string => {
  const isSigning = sign === "sign";
  const isInitialStep = step === "initialStep";
  const isSingleAct = act.length === 1;
  const isMultipleActs = act.length > 1;

  if (isSigning) {
    if (isInitialStep) {
      return isSingleAct ? "Согласование акта" : "Пакетное согласование";
    }
    return "Введите SMS-код";
  } else {
    // cancel scenario
    if (isInitialStep) {
      return isSingleAct ? "Отклонение акта" : "Пакетное отклонение";
    }
    return "Введите SMS-код";
  }
};