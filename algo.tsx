import React, { useState, FC } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ControlledAutocompleteEmail, ControlledAutocompletePhone, Alert, Button, CardLayout, AvatarMrm } from "@sg/uikit";

// --- 1. СХЕМА ВАЛИДАЦИИ ---
export const paymentStepSchema = z.object({
  email: z.string().email("Некорректный email"),
  phone: z.string().min(10, "Некорректный номер телефона"),
});

export type PaymentStepSchema = z.infer<typeof paymentStepSchema>;

// --- 2. КОНФИГ (ДАННЫЕ ДЛЯ ШАГОВ) ---
export type PaymentStepStatus = "importContacts" | "awaitPayment" | "repeatInputContacts";

export const paymentStepConfig = {
  importContacts: {
    alertType: "info",
    alertTitle: "Отправьте ссылку на оплату",
    alertDescription: "Ссылка на документы уйдёт на email. Контакты можно изменить, отправку по СМС — включить дополнительно.",
    buttonText: "Отправить",
  },
  awaitPayment: {
    alertType: "success",
    alertTitle: "Ссылка на оплату отправлена",
    alertDescription: "28.12.2025 13:44, baza_salesman@ya.ru", // В реале передавать динамически
    buttonText: "Клиенту не пришла ссылка?",
    isLinkVisible: true,
  },
  repeatInputContacts: {
    alertType: "warning",
    alertTitle: "Повторная отправка",
    alertDescription: "Проверьте контакты и попробуйте отправить ссылку еще раз.",
    buttonText: "Отправить снова",
  }
} as const;

// Заглушка для контекста и типов (вставь свои импорты)
type Suggestion<T> = { label: string; value: T };
type Args = {
  policyholderEmail: string;
  policyholderPhone: string;
};

// --- 3. КОНТРОЛЛЕР ---
export const usePaymentStepController = ({ policyholderEmail, policyholderPhone }: Args) => {
  // Предполагаем, что epkData приходит из контекста
  const epkData = {
    contacts: [
      { contactType: "email", value: "test1@mail.ru" },
      { contactType: "phone", value: "+79991112233" }
    ]
  };

  const [status, setStatus] = useState<PaymentStepStatus>("importContacts");
  const [paymentLink, setPaymentLink] = useState<string>("");

  // Генерация подсказок
  const [contactsSuggestions] = useState(() => {
    const emails: Suggestion<string>[] = [];
    const phones: Suggestion<string>[] = [];

    epkData.contacts.forEach(({ contactType, value }) => {
      if (contactType === "email") emails.push({ label: value, value });
      if (contactType === "phone") phones.push({ label: value, value });
    });

    return { emails, phones };
  });

  const form = useForm<PaymentStepSchema>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(paymentStepSchema),
    values: {
      email: policyholderEmail,
      phone: policyholderPhone,
    },
  });

  // Обработка отправки формы (переход на awaitPayment)
  const handleSubmit: SubmitHandler<PaymentStepSchema> = async (data) => {
    // Имитация API запроса
    await new Promise((resolve) => setTimeout(resolve, 500));
    const fakeLink = "https://pay.sogaz.ru/p/a8f3k2m9x7q4n6p1w5r8t2y9...k92";
    setPaymentLink(fakeLink);
    setStatus("awaitPayment");
  };

  // Обработка кнопки "Клиенту не пришла ссылка?" (переход на repeatInputContacts)
  const handleRepeat = () => {
    setStatus("repeatInputContacts");
  };

  // Обработка повторной отправки
  const handleRepeatSubmit: SubmitHandler<PaymentStepSchema> = (data) => {
    handleSubmit(data);
  };

  return {
    status,
    contactsSuggestions,
    form,
    paymentLink,
    handleSubmit,
    handleRepeat,
    handleRepeatSubmit,
  };
};

// --- 4. КОМПОНЕНТ ---
export const PaymentStep: FC<Args> = (props) => {
  const { 
    status, 
    contactsSuggestions, 
    form, 
    paymentLink, 
    handleSubmit, 
    handleRepeat, 
    handleRepeatSubmit 
  } = usePaymentStepController(props);

  const currentConfig = paymentStepConfig[status];

  // Функция для рендера формы (используется в importContacts и repeatInputContacts)
  const renderForm = (onSubmitHandler: SubmitHandler<PaymentStepSchema>) => (
    <form className="mt-4" onSubmit={form.handleSubmit(onSubmitHandler)}>
      <div className="flex flex-col gap-4 mb-4">
        <ControlledAutocompletePhone
          control={form.control}
          name="phone"
          label="Введите телефон клиента"
          size="xl"
          foreignSuggestions={[{
            groupLabel: "Данные клиента",
            groupOptions: contactsSuggestions.phones,
          }]}
        />
        <ControlledAutocompleteEmail
          control={form.control}
          name="email"
          inputProps={{ label: "Введите почту клиента", size: "xl" }}
          foreignSuggestions={contactsSuggestions.emails}
        />
      </div>
      <Button type="submit" disabled={!form.formState.isValid}>
        {currentConfig.buttonText}
      </Button>
    </form>
  );

  return (
    <CardLayout
      title="Отправить на оплату"
      // @ts-ignore (заглушка для ассетов)
      avatarSlot={<AvatarMrm size="46" src={ASSETS?.PRODUCTS?.DOCUMENTS} />}
    >
      {/* Универсальный Alert, данные берутся из конфига */}
      <Alert
        type={currentConfig.alertType as any}
        title={currentConfig.alertTitle}
        description={currentConfig.alertDescription}
      />

      {/* Рендер по статусу */}
      {status === "importContacts" && renderForm(handleSubmit)}

      {status === "repeatInputContacts" && (
        <div className="mt-4">
           {renderForm(handleRepeatSubmit)}
        </div>
      )}

      {status === "awaitPayment" && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col gap-2 mb-4">
            <span className="text-sm text-gray-500">Ссылка на оплату</span>
            <div className="flex items-center justify-between gap-4 bg-white p-2 border rounded">
                <span className="text-sm truncate">{paymentLink}</span>
                <Button variant="secondary" onClick={() => navigator.clipboard.writeText(paymentLink)}>
                Копировать
                </Button>
            </div>
          </div>
          
          <Button variant="ghost" className="text-blue-600 p-0" onClick={handleRepeat}>
            {currentConfig.buttonText}
          </Button>
        </div>
      )}
    </CardLayout>
  );
};