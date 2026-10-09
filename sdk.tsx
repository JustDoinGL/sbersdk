// insuranceTermConfig.ts

export type InsuranceTermKey = 
  | 'standardAnnual'
  | 'shortTerm'
  | 'transit'
  | 'nonResident';

export interface InsuranceTermAlert {
  header: string;
  description: string;
}

export const insuranceTermConfig: Record<InsuranceTermKey, InsuranceTermAlert> = {
  standardAnnual: {
    header: "Стандартный годовой полис",
    description: "Полная защита автомобиля на весь срок страхования",
  },
  shortTerm: {
    header: "Краткосрочный полис до 3 месяцев",
    description: "Для автомобилей, зарегистрированных в РФ или подлежащих регистрации",
  },
  transit: {
    header: "Полис для перегона автомобиля",
    description: "Для перегона к месту регистрации после покупки",
  },
  nonResident: {
    header: "Собственник — нерезидент",
    description: "Срок договора выбирается датами: от 5 дней до 12 месяцев",
  },
};