import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

export const useFormWithStatus = <T extends Record<string, any>>({
  schema,
  defaultValues,
  onSubmit,
}: {
  schema: any; // Zod схема
  defaultValues: Partial<T>;
  onSubmit: (data: T) => Promise<void> | void;
}) => {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = async (data: T) => {
    setStatus("loading");
    try {
      await onSubmit(data);
      setStatus("success");
      setError(null);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    }
  };

  const FormComponent = ({
    children,
    successContent,
    errorContent,
    loadingContent,
  }: {
    children: React.ReactNode;
    successContent: React.ReactNode;
    errorContent?: React.ReactNode;
    loadingContent?: React.ReactNode;
  }) => {
    if (status === "success") {
      return <>{successContent}</>;
    }

    if (status === "error") {
      return <>{errorContent || <div>Error: {error}</div>}</>;
    }

    if (status === "loading") {
      return <>{loadingContent || <div>Loading...</div>}</>;
    }

    return (
      <form onSubmit={methods.handleSubmit(handleSubmit)}>
        {children}
      </form>
    );
  };

  return {
    ...methods,
    FormComponent,
    status,
    error,
    isSubmitting: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
  };
};




const MyForm = () => {
  const { FormComponent, control } = useFormWithStatus({
    schema: focuschema,
    defaultValues: {
      City: "",
      Company: "",
      XML: "",
      FirstName: "",
      PhoneNumber: "7",
    },
    onSubmit: async (data) => {
      console.log(data);
      // Здесь ваш API запрос
      // await api.submitForm(data);
    },
  });

  return (
    <FormComponent
      successContent={<div>Форма успешно отправлена!</div>}
      errorContent={<div>Ошибка при отправке формы</div>}
      loadingContent={<div>Отправляем данные...</div>}
    >
      <Controller
        name="FirstName"
        control={control}
        render={({ field }) => <input {...field} placeholder="Имя" />}
      />
      {/* Другие поля формы */}
      <button type="submit">Отправить</button>
    </FormComponent>
  );
};