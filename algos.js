import { type MultiselectProps, Multiselect, Button, useToast, type Option } from "@sg/utkit";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { ErrorMessage } from "./error_message";
import { useRef, useState, useCallback } from "react";
import { api, ProfileDto } from "@/5_shared/api";

type Props<FormData extends FieldValues> = {
  control: Control<FormData>;
  name: Path<FormData>;
  wrapperClassName?: string;
} & MultiselectProps<Option>;

export const ControlledMultiselectManager = <FormData extends FieldValues>({
  control,
  name,
  wrapperClassName,
  ...rest
}: Props<FormData>) => {
  const [managersOptions, setManagersOptions] = useState<ProfileDto[]>([]);
  const { push } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const searchManagers = async (search: string) => {
    try {
      const response = await api.profile_methods.getProfileByQuery(search || " ");
      setManagersOptions(response.results);
    } catch (e) {
      console.log(e);
      push({ title: "Ошибка при загрузке списка", type: "error" });
    }
  };

  const debouncedSearchManagers = useCallback((search: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      searchManagers(search);
    }, 500);
  }, [searchManagers]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={wrapperClassName}>
          <Multiselect
            label="Выберите менеджеров"
            placeholder="Начните вводить имя менеджера..."
            options={managersOptions}
            selected={field.value}
            onSelect={(value) => field.onChange(value)}
            onInputChange={debouncedSearchManagers}
            selectedItemsDisplayMode="below"
            buttonClear={
              <Button variant="ghost" onClick={() => field.onChange([])}>
                Очистить все
              </Button>
            }
            {...rest}
          />
          {fieldState.error?.message && (
            <ErrorMessage error={fieldState.error.message} />
          )}
        </div>
      )}
    />
  );
};