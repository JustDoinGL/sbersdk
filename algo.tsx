// Базовые схемы
const restrictedAreaBase = z.boolean();
const restrictedAreaObject = z.object({ 
  value: z.boolean(), 
  label: z.string() 
});

// Схема для формы (вход: boolean, выход: объект)
export const formInputSchema = z.object({
  restricted_area: restrictedAreaBase.transform((bool) => 
    restrictedAreaTypesOptions.find(opt => opt.value === bool)!
  ),
  activity_type: z.number().optional(),
});

// Схема для API (вход: объект, выход: boolean)
export const formOutputSchema = z.object({
  restricted_area: restrictedAreaObject.transform((obj) => obj.value),
  activity_type: z.number().optional(),
});

// Комбинированная схема для типов
export const SalesPointFormSchema = z.object({
  restricted_area: restrictedAreaObject,
  activity_type: z.number().optional(),
});

export type SalesPointFormSchema = z.infer<typeof SalesPointFormSchema>;

// Мапперы
export const mapperSalesPointForm = (salesPoint: SalesPointDto) => {
  return formInputSchema.parse(salesPoint);
};

export const mapperSalesPointToApi = (formData: SalesPointFormSchema) => {
  return formOutputSchema.parse(formData);
};