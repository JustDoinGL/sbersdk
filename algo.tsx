import { baseSchema } from "@/5_shared/validators/baseschema";
import { z } from "zod";
import { SalesPointDto } from "@/5_shared/api";

export const restrictedAreaTypesOptions = [
  {
    label: "Да",
    value: true,
  },
  {
    label: "Нет",
    value: false,
  },
] as const;

// Типы для опций
type RestrictedAreaOption = {
  value: boolean;
  label: string;
};

// Базовые типы
export type SalesPointFormData = {
  restricted_area: RestrictedAreaOption;
  activity_type?: number;
};

// Универсальная схема с двусторонним преобразованием
export const SalesPointFormSchema = {
  // Для парсинга входящих данных API → Form (boolean → объект)
  parse: (data: SalesPointDto): SalesPointFormData => {
    return z.object({
      restricted_area: z.boolean().transform((bool) => {
        const option = restrictedAreaTypesOptions.find(opt => opt.value === bool);
        if (!option) {
          throw new Error(`Не найдена опция для значения: ${bool}`);
        }
        return option;
      }),
      activity_type: z.number().optional(),
    }).parse(data);
  },

  // Для подготовки к отправке Form → API (объект → boolean)
  serialize: (data: SalesPointFormData): SalesPointDto => {
    return z.object({
      restricted_area: z.object({ 
        value: z.boolean(), 
        label: z.string() 
      }).transform((obj) => obj.value),
      activity_type: z.number().optional(),
    }).parse(data);
  },

  // Для валидации формы в React Hook Form
  schema: z.object({
    restricted_area: z.object({ 
      value: z.boolean(), 
      label: z.string() 
    }).refine(
      (obj) => restrictedAreaTypesOptions.some(opt => 
        opt.value === obj.value && opt.label === obj.label
      ),
      { message: "Некорректное значение для restricted_area" }
    ),
    activity_type: z.number().min(0, "Значение должно быть положительным").optional(),
  })
};

// Вспомогательные типы
export type SalesPointFormSchemaType = z.infer<typeof SalesPointFormSchema.schema>;