// FormComponent.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { guidebookValidation } from "./guidebookValidation";

export const Form = () => {
  const { register, watch, setValue } = useForm({
    resolver: zodResolver(z.object(guidebookValidation)),
  });

  // Форматируем при каждом изменении
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const lastChar = rawValue.slice(-1);
    
    // Пропускаем пробел, если предыдущий символ уже пробел
    if (lastChar === " " && rawValue.slice(-2, -1) === " ") return;

    const formatted = rawValue
      .split(" ")
      .map(word => word && (word[0]?.toUpperCase() + word.slice(1).toLowerCase()))
      .join(" ");

    setValue("FirstName", formatted, { shouldValidate: true });
  };

  return (
    <form>
      <input
        {...register("FirstName")}
        onChange={handleNameChange}
        placeholder="Иван Иванов"
      />
      <button type="submit">Отправить</button>
    </form>
  );
};


// FormComponent.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { guidebookValidation } from "./guidebookValidation";

export const Form = () => {
  const { register, watch, setValue } = useForm({
    resolver: zodResolver(z.object(guidebookValidation)),
  });

  // Форматируем при каждом изменении
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const lastChar = rawValue.slice(-1);
    
    // Пропускаем пробел, если предыдущий символ уже пробел
    if (lastChar === " " && rawValue.slice(-2, -1) === " ") return;

    const formatted = rawValue
      .split(" ")
      .map(word => word && (word[0]?.toUpperCase() + word.slice(1).toLowerCase()))
      .join(" ");

    setValue("FirstName", formatted, { shouldValidate: true });
  };

  return (
    <form>
      <input
        {...register("FirstName")}
        onChange={handleNameChange}
        placeholder="Иван Иванов"
      />
      <button type="submit">Отправить</button>
    </form>
  );
};