import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { data, form2, type FormData } from "./shema";
import { DevTool } from "@hookform/devtools";

function App() {
  const [currentStep, setCurrentStep] = useState(0);

  const methods = useForm<FormData>({
    resolver: zodResolver(form2),
    mode: "onChange",
  });

  const { handleSubmit, trigger } = methods;

  const onSubmit = async (formData: FormData) => {
    console.log("Все данные формы:", formData);
    // Здесь обычно отправка на сервер
  };

  const handleNext = async () => {
    const currentStepFields = data[currentStep].fields;

    console.log("Валидируем поля:", currentStepFields);

    const isValid = await trigger(currentStepFields);

    if (isValid) {
      console.log("Шаг валиден, переходим дальше");

      if (currentStep < data.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleSubmit(onSubmit)();
      }
    } else {
      console.log("Шаг невалиден, ошибки:", methods.formState.errors);
    }
  };

  const handlePrev = () =>
    setCurrentStep((prev) => (prev === 0 ? 0 : prev - 1));

  const CurrentForm = data[currentStep].Component;

  return (
    <>
      <FormProvider {...methods}>
        <DevTool control={methods.control} />
        {currentStep}

        <form className="main">
          <CurrentForm />
        </form>
      </FormProvider>

      <div>
        <button onClick={handleNext}>Вперед</button>
        <button onClick={handlePrev}>Назад</button>
      </div>
    </>
  );
}

export default App;


--------------

import type z from "zod";
import { form, form1Schema } from "./1";
import { form2Schema, form2 as from3 } from "./2";

export const form2 = form1Schema.and(form2Schema);

export type FormData = z.infer<typeof form2>;

export const data = [form, from3];



----------------



      const {
    register,
    formState: { errors, isSubmitSuccessful },
  } = useFormContext<FormData>();




_---------------




    import { z } from "zod";

export const form2Schema = z
  .object({
    firstName2: z
      .string()
      .min(2, "Имя должно содержать минимум 2 символа")
      .max(50, "Имя слишком длинное"),

    lastName2: z
      .string()
      .min(2, "Фамилия должна содержать минимум 2 символа")
      .max(50, "Фамилия слишком длинная"),

    email2: z.string().email("Введите корректный email"),

    age2: z
      .number()
      .min(18, "Вы должны быть старше 18 лет")
      .max(120, "Введите корректный возраст"),

    password2: z
      .string()
      .min(6, "Пароль должен содержать минимум 6 символов")
      .regex(/[A-Z]/, "Пароль должен содержать хотя бы одну заглавную букву")
      .regex(/[0-9]/, "Пароль должен содержать хотя бы одну цифру"),

    confirmPassword2: z.string().min(6, "Подтвердите пароль"),
  })
  .refine((data) => data.password2 === data.confirmPassword2, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type FormKeys = keyof z.infer<typeof form2Schema>;
export type FormData = z.infer<typeof form2Schema>;
export const form2Fields: FormKeys[] = Object.keys(
  form2Schema.shape
) as FormKeys[];

