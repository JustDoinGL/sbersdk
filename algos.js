// =====================================================================
// ФАЙЛ: src/modules/products/domain/kasko/1_screens/vehicle/vehicle_kasko.tsx
// =====================================================================

import { useWatch } from "react-hook-form";
import { buildVehicleValuationAttributes } from "./vehicle_valuation"; // Предполагаемый путь импорта

// ... (другие импорты и код компонента)

export const Vehicle: FC = () => {
  // ... (другой код)

  // 1. ИСПРАВЛЕНИЕ: Добавляем purchaseDate и carMileage в деструктуризацию useWatch
  // Теперь TypeScript не будет ругаться, что они объявлены, но не используются.
  const [
    category,
    maker,
    model,
    modificationCode,
    modificationName,
    yearOfProduction,
    vin,
    bodyNumber,
    regNumber,
    enginePower,
    engineVolume,
    countOfSeats,
    vehicleType,
    makerForPrint,
    modelForPrint,
    maxWeight,
    purchaseDate, // <-- ДОБАВЛЕНО
    carMileage,   // <-- ДОБАВЛЕНО
  ] = useWatch({
    control: form.control,
    name: PRICE_RANGE_ATTRIBUTE_FIELD_NAMES,
  });

  const priceRangeAttributes = buildVehicleValuationAttributes({
    fieldValues: {
      bodyNumber,
      category,
      countOfSeats,
      enginePower,
      engineVolume,
      maker,
      makerForPrint,
      maxWeight,
      model,
      modelForPrint,
      modificationCode,
      modificationName,
      regNumber,
      vehicleType,
      vin,
      yearOfProduction,
      purchaseDate, // <-- ПЕРЕДАЕМ СЮДА
      carMileage,   // <-- ПЕРЕДАЕМ СЮДА
    },
    hasPreviousInsurancePolicy,
    isProlongation: dealData.prolongation,
    requestId: calculationData.calculation_id || String(calculationData.id),
    vehicleCategoryOptions: vehicle_category,
    vehicleTypeOptions: vehicle_type,
    // ... другие параметры
  });

  // ... (остальной код)
};


// =====================================================================
// ФАЙЛ: src/modules/products/domain/kasko/1_screens/vehicle/vehicle_valuation.ts
// =====================================================================

// ... (импорты)

// 1. ИСПРАВЛЕНИЕ: Добавляем поля в тип, чтобы TS знал о них
type VehicleValuationFieldValues = {
  bodyNumber: unknown;
  category: unknown;
  countOfSeats: unknown;
  enginePower: unknown;
  engineVolume: unknown;
  maker: unknown;
  makerForPrint: unknown;
  maxWeight: unknown;
  model: unknown;
  modelForPrint: unknown;
  modificationCode: unknown;
  modificationName: unknown;
  regNumber: unknown;
  vehicleType: unknown;
  vin: unknown;
  yearOfProduction: unknown;
  purchaseDate: unknown; // <-- ДОБАВЛЕНО
  carMileage: unknown;   // <-- ДОБАВЛЕНО
};

// ... (вспомогательные функции toString, toNumber, hasValue, getOptionLabel)

// 2. ИСПРАВЛЕНИЕ: Функция addOptionalString уже проверяет наличие значения.
// Если purchaseDate или carMileage пустые, они просто не добавятся в attributes.
// Если они есть, они добавятся в запрос. Это и есть логика "не отправлять, пока их нет".
const addOptionalString = <Key extends keyof CarPriceRangeAttributes>(
  target: Partial<CarPriceRangeAttributes>,
  key: Key,
  value: unknown,
) => {
  const normalizedValue = toString(value);

  // Если строка не пустая, добавляем её в объект
  if (normalizedValue) {
    target[key] = normalizedValue as CarPriceRangeAttributes[Key];
  }
};

// ... (функция addOptionalNumber)

export const buildVehicleValuationAttributes = ({
  fieldValues,
  hasPreviousInsurancePolicy,
  isProlongation,
  requestId,
  vehicleCategoryOptions,
  vehicleTypeOptions,
  user,
  referencesBusinessSegmentSet,
}: {
  fieldValues: VehicleValuationFieldValues;
  hasPreviousInsurancePolicy: boolean;
  isProlongation: boolean;
  requestId: string;
  vehicleCategoryOptions: OptionLike[];
  vehicleTypeOptions: OptionLike[];
  user: ReturnType<typeof useUser>;
  referencesBusinessSegmentSet: References["business_segment"];
}): Partial<CarPriceRangeAttributes> => {
  const {
    bodyNumber,
    category,
    countOfSeats,
    enginePower,
    engineVolume,
    maker,
    makerForPrint,
    maxWeight,
    model,
    modelForPrint,
    modificationCode,
    modificationName,
    regNumber,
    vehicleType,
    vin,
    yearOfProduction,
    purchaseDate, // <-- Извлекаем здесь
    carMileage,   // <-- Извлекаем здесь
  } = fieldValues;

  const fullName = [maker, model, modificationName].map(toString).filter(Boolean).join(" ");
  
  const attributes: Partial<CarPriceRangeAttributes> = {
    businessType: getBusinessType({ hasPreviousInsurancePolicy, isProlongation }),
    modificationCode: toString(modificationCode),
    requestChannel: mapBusinessSegment(user, referencesBusinessSegmentSet),
    requestId,
    salesChannel: "MRM",
    yearOfProduction: toNumber(yearOfProduction),
  };

  // ... (добавление остальных полей через addOptionalString / addOptionalNumber)

  addOptionalString(attributes, "bodyNumber", bodyNumber);
  addOptionalString(attributes, "category", category);
  addOptionalString(attributes, "categoryName", getOptionLabel(vehicleCategoryOptions, category));
  addOptionalNumber(attributes, "countOfSeats", countOfSeats);
  addOptionalNumber(attributes, "enginePower", enginePower);
  addOptionalNumber(attributes, "engineVolume", engineVolume);
  addOptionalString(attributes, "fullName", fullName);
  addOptionalString(attributes, "maker", maker);
  addOptionalNumber(attributes, "maxWeight", maxWeight);
  addOptionalString(attributes, "model", model);
  addOptionalString(attributes, "modificationName", modificationName);
  addOptionalString(attributes, "regNumber", regNumber);
  addOptionalString(attributes, "vehicleType", vehicleType);
  addOptionalString(
    attributes,
    "vehicleTypeName",
    getOptionLabel(vehicleTypeOptions, vehicleType),
  );
  addOptionalString(attributes, "vin", vin);
  addOptionalString(attributes, "writtenMake", makerForPrint);
  addOptionalString(attributes, "writtenModel", modelForPrint);

  // 3. ИСПРАВЛЕНИЕ: Добавляем purchaseDate и carMileage в attributes
  // Важно: Проверьте, что эти ключи ("purchaseDate", "carMileage") существуют 
  // в типе CarPriceRangeAttributes. Если нет — их нужно добавить в тип.
  addOptionalString(attributes, "purchaseDate", purchaseDate);
  addOptionalNumber(attributes, "carMileage", carMileage); // Если пробег число

  // Логика удаления maker/model, если есть writtenMake/writtenModel
  if (hasValue(makerForPrint)) {
    delete attributes.maker;
  }
  if (hasValue(modelForPrint)) {
    delete attributes.model;
  }

  return attributes;
};