import { z } from "zod";

// Основная схема для договора ОСАГО
const osagoContractSchema = z.object({
  // Основные поля договора
  contractNumber: z.string(), // номер договора
  policySeries: z.string(), // серия полиса
  policyNumber: z.string(), // номер полиса
  
  // Стороны договора
  insurer: z.object({ // страховщик
    name: z.string(),
    inn: z.string().length(10), // ИНН (10 цифр)
    ogrn: z.string().min(13).max(15) // ОГРН
  }),
  
  insured: z.object({ // страхователь
    fullName: z.string(),
    birthDate: z.string().date(), // дата рождения
    passportSeries: z.string().length(4), // серия паспорта
    passportNumber: z.string().length(6), // номер паспорта
    driverLicense: z.string().optional() // водительское удостоверение (необязательно)
  }),
  
  // Объект страхования
  vehicle: z.object({
    vin: z.string(), // VIN номер
    licensePlate: z.string(), // госномер
    brand: z.string(), // марка
    model: z.string(), // модель
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1) // год выпуска
  }),
  
  // Период действия
  validityPeriod: z.object({
    startDate: z.string().date(), // дата начала
    endDate: z.string().date() // дата окончания
  }),
  
  // Стоимость
  price: z.object({
    insurancePremium: z.number().positive(), // страховая премия
    calculationDate: z.string().date() // дата расчета
  }),
  
  // Дополнительные поля
  isNewInsurer: z.boolean().optional(), // новый страховщик (необязательно)
  additionalInfo: z.string().optional(), // дополнительная информация
  createdAt: z.string().datetime() // дата создания записи
});

// Тип для TypeScript
type OsagoContract = z.infer<typeof osagoContractSchema>;