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

export const SalesPointInputDate: React.FC<Props> = ({ unitId, preview }) => {
  const [date, setDate] = useState<string | null>(() => formatData(preview));
  const [error, setError] = useState(false);
  const { push } = useToast();

  const handleDateChange = (value: string | null) => {
    setError(false);
    setDate(value);
  };

  const sendSalesPointDate = async () => {
    console.log(date);
    
    if (!date || !dateUtils.isDatePassed(date)) {
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

  return (
    <InputDate
      size="sm"
      placeholder="Выберите дату"
      hasError={error}
      onBlur={sendSalesPointDate}
      value={date}
      onChange={handleDateChange}
    />
  );
};