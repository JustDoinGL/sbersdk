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
];

// 1. Схема для входящих данных (преобразование boolean в объект)
export const inputSalesPointSchema = z.object({
  restricted_area: z.boolean(),
  activity_type: z.number().optional(),
});

// 2. Схема для формы (объект с value/label)
export const SalesPointFormSchema = z.object({
  restricted_area: z.object({ 
    value: z.boolean(), 
    label: z.string() 
  }),
  activity_type: z.number().optional(),
});

export type SalesPointFormSchema = z.infer<typeof SalesPointFormSchema>;

// 3. Схема для отправки на бекенд (обратно в boolean)
export const apiSalesPointSchema = z.object({
  restricted_area: z.boolean(),
  activity_type: z.number().optional(),
});

// Маппер для преобразования входящих данных в форму
export const mapperSalesPointForm = (salesPoint: SalesPointDto) => {
  return {
    restricted_area: restrictedAreaTypesOptions.find(
      (el) => el.value === salesPoint.restricted_area,
    ),
    activity_type: salesPoint.activity_type,
  };
};

// Маппер для преобразования формы в данные для API
export const mapperSalesPointToApi = (formData: SalesPointFormSchema) => {
  return {
    restricted_area: formData.restricted_area.value, // boolean
    activity_type: formData.activity_type,
  };
};