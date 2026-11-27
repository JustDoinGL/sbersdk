// Можно вынести тип для элемента, чтобы TypeScript помогал
type InsuredReq = CreatePolicyReq['insureds'][number]; 

// Вспомогательная функция-маппер для преобразования одного клиента
const mapToInsured = (clientId: string): InsuredReq => ({
  hid: clientId,
  partyType: "PHYSICAL",
  // Если по типам требует sourceSystem, раскомментируй и добавь:
  // sourceSystem: "SOME_SYSTEM", 
});

export const mapDmsFormToRes = (data: OutputDmsSchema): CreatePolicyReq => {
  const { program, policyholder, insureds } = data;

  // Переиспользуем функцию mapToInsured в обоих случаях
  const insuredsRes = policyholder.isPolicyHolderInsured
    ? [mapToInsured(policyholder.clientId)] 
    : insureds.map((insured) => mapToInsured(insured.clientId));

  return {
    programVariantId: program.programVariant?.id || "",
    policyHolder: mapToInsured(policyholder.clientId), // Тоже используем хелпер, если типы совпадают
    insureds: insuredsRes,
  };
};