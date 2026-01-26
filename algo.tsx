import { z } from 'zod';

const EMPTY_MESSAGE = "EMPTY_MESSAGE";

// Исходная схема
const physicalSchema = z.object({
  name: z.string().min(1, { message: EMPTY_MESSAGE }),
  email: z.string().email().min(1, { message: EMPTY_MESSAGE }),
});

// Функция для добавления префиксов
function createPrefixedSchema<T extends z.ZodObject<any>>(
  schema: T,
  prefix: string
) {
  const shape = schema.shape;
  const prefixedShape: Record<string, z.ZodTypeAny> = {};
  
  Object.keys(shape).forEach((key) => {
    prefixedShape[`${prefix}_${key}`] = shape[key];
  });
  
  return z.object(prefixedShape);
}

// Создаем схему с префиксом
const userPhysicalSchema = createPrefixedSchema(physicalSchema, "user");

// Тип вывода
type UserPhysicalSchema = z.infer<typeof userPhysicalSchema>;
// Теперь тип имеет ключи: user_name, user_email

// Получаем ключи
const keys = Object.keys(userPhysicalSchema.shape) as Array<keyof UserPhysicalSchema>;
// keys = ["user_name", "user_email"]