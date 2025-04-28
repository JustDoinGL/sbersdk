import { Controller } from "react-hook-form";
import { guidebookValidation } from "./guidebookValidation";

const formatName = (value: string) => {
  return value
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const FormField: FC<FormProps> = ({ element }) => {
  const { control, formState: { errors } } = useFormContext();
  const [isValid, setIsValid] = useState(false);

  const handleChange = (value: string, onChange: (value: string) => void) => {
    const formattedValue = formatName(value);
    onChange(formattedValue); // Отправляем отформатированное значение в RHF
    const validationResult = guidebookValidation[element.name].safeParse(formattedValue);
    setIsValid(validationResult.success);
  };

  return (
    <Controller
      name={element.name}
      control={control}
      render={({ field }) => {
        return (
          <InputText
            id={element.name}
            name={element.name}
            ref={field.ref}
            onBlur={() => {
              field.onBlur();
              onBlurHandleImg(guidebookValidation[element.name], field.value, field.onBlur);
            }}
            onChange={(e) => handleChange(e.target.value, field.onChange)}
            value={field.value}
            size={inputSize.large}
            label={element.label ?? ''}
            placeholder={element.placeholder ?? ''}
            error={errors[element.name]?.message ? `${errors[element.name]?.message}` : null}
            valid={field.value && isValid}
          />
        );
      }}
    />
  );
};