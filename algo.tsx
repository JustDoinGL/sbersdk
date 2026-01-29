import { z } from 'zod';

// Схема для водительского удостоверения
const driverLicenseSchema = z.object({
  type: z.string().min(1, "Тип ВУ обязателен"),
  seriesNumber: z.string().min(1, "Серия и номер ВУ обязательны"),
  issueDate: z.string().min(1, "Дата начала стажа обязательна"),
});

// Схема для предыдущего ВУ (необязательно)
const previousLicenseSchema = driverLicenseSchema.partial().optional();

// Схема для одного водителя
const driverSchema = z.object({
  fullName: z.string().min(1, "ФИО обязательно"),
  birthDate: z.string().min(1, "Дата рождения обязательна"),
  currentLicense: driverLicenseSchema,
  hasChangedLicense: z.boolean().default(false),
  previousLicense: previousLicenseSchema,
});

// Схема для формы с несколькими водителями
const driversFormSchema = z.object({
  drivers: z.array(driverSchema).min(1, "Добавьте хотя бы одного водителя"),
  insuranceScope: z.enum(["specific", "any"]).default("specific"),
  selectedStation: z.string().optional(),
});

// Типы TypeScript
type DriverLicense = z.infer<typeof driverLicenseSchema>;
type PreviousLicense = z.infer<typeof previousLicenseSchema>;
type Driver = z.infer<typeof driverSchema>;
type DriversFormData = z.infer<typeof driversFormSchema>;