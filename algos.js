import { api } from "@/5_shared/api";
import { dateUtils } from "@/5_shared/date";
import { InputDate, useToast } from "@sg/uikit";
import { useState } from "react";

type Props = {
  unitId: string;
  preview: string | null;
};

const formatData = (date: string | null) => {
  if (typeof date !== "string") {
    return null;
  }
  return dateUtils.getLocaleDate(date);
};

// Конвертирует формат "день.месяц.год" в стандартный формат даты
const convertDotFormatToDate = (dateString: string | null): string | null => {
  if (!dateString) return null;
  
  // Проверяем формат "день.месяц.год"
  const dotFormatRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
  const match = dateString.match(dotFormatRegex);
  
  if (match) {
    const [, day, month, year] = match;
    // Создаем дату в формате YYYY-MM-DD
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  return dateString;
};

const isDateValid = (date: string | null): boolean => {
  if (!date) return false;
  
  // Конвертируем если нужно
  const convertedDate = convertDotFormatToDate(date);
  if (!convertedDate) return false;
  
  return dateUtils.isDatePassed(convertedDate);
};

export const SalesPointInputDate: React.FC<Props> = ({ unitId, preview }) => {
  const [date, setDate] = useState<string | null>(() => formatData(preview));
  const [error, setError] = useState(false);
  const { push } = useToast();

  const handleDateChange = (date: string | null) => {
    setError(false);
    
    // Конвертируем формат "день.месяц.год" при изменении
    const convertedDate = convertDotFormatToDate(date);
    setDate(convertedDate);
  };

  const sendSalesPointDate = async () => {
    console.log('Current date:', date);
    
    if (!date || !isDateValid(date)) {
      setError(true);
      return;
    }

    try {
      await api.sales_point.patchSalesPointUnit(unitId, {
        close_date: dateUtils.getIsoDate(date),
      });
      push({ type: "success", title: "Дата успешно изменена" });
    } catch (error) {
      console.error(error);
      push({ type: "error", title: "Ошибка при изменении даты" });
    }
  };

  // Функция для отображения даты в нужном формате
  const getDisplayValue = (): string | undefined => {
    if (!date) return undefined;
    
    // Если дата уже в формате "день.месяц.год", возвращаем как есть
    const dotFormatRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
    if (date.match(dotFormatRegex)) {
      return date;
    }
    
    // Иначе конвертируем в формат для отображения
    try {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}.${month}.${year}`;
      }
    } catch (e) {
      console.error('Error formatting date:', e);
    }
    
    return date;
  };

  return (
    <InputDate
      size="sm"
      placeholder="дд.мм.гггг"
      hasError={error}
      onBlur={sendSalesPointDate}
      value={getDisplayValue()}
      onChange={handleDateChange}
    />
  );
};