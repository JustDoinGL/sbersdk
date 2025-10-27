// Универсальная схема с двусторонним преобразованием
export const SalesPointFormSchema = {
  // Для парсинга входящих данных (boolean → объект)
  parse: (data: SalesPointDto) => 
    z.object({
      restricted_area: z.boolean().transform((bool) => 
        restrictedAreaTypesOptions.find(opt => opt.value === bool)!
      ),
      activity_type: z.number().optional(),
    }).parse(data),

  // Для подготовки к отправке (объект → boolean)  
  serialize: (data: SalesPointFormSchema) =>
    z.object({
      restricted_area: z.object({ 
        value: z.boolean(), 
        label: z.string() 
      }).transform((obj) => obj.value),
      activity_type: z.number().optional(),
    }).parse(data),

  // Для валидации формы
  schema: z.object({
    restricted_area: z.object({ 
      value: z.boolean(), 
      label: z.string() 
    }),
    activity_type: z.number().optional(),
  })
};

// Использование:
const formData = SalesPointFormSchema.parse(apiData); // boolean → объект
const apiData = SalesPointFormSchema.serialize(formData); // объект → boolean