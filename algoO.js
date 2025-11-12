const mapSchemaToDto = (schema: DealFiltersFormSchema): Record<string, string | string[] | undefined> => {
  const getEndDate = (): string[] | undefined => {
    if (!schema.end_date?.[0] || !schema.end_date?.[1]) {
      return undefined;
    }
    
    return schema.end_date.map(date => dateUtils.getDtoDate(date!));
  };

  return {
    manager: schema.manager ?? undefined,
    deal_type: schema.deal_type?.value ?? undefined,
    stage: schema.stage?.map(item => item.value).filter(Boolean).join(",") ?? undefined,
    insurance: schema.insurance?.map(item => item.value).filter(Boolean).join(",") ?? undefined,
    end_date: getEndDate(), // Теперь это вызов функции, а не сама функция
  };
};