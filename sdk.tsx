import { Controller, useFormContext } from "react-hook-form";
import { AutoComplete } from "..."; // Ваш UI-компонент
import { ASSETS } from "...";
import { Chip, CardLayout } from "..."; // Ваши UI-компоненты

// Предполагаем, что у вас есть типы для формы и программы
// type Program = { id: string; label: string; ... } 
// type FormValues = { program: { region: Program | null, ... } }

interface RegionFieldProps {
  regions: Array<{ label: string; value: Program }>; // Или как у вас типизирован массив регионов
  popularRegions: Array<{ label: string }>;
  isRegionAvailable: boolean;
}

export const RegionField = ({ regions, popularRegions, isRegionAvailable }: RegionFieldProps) => {
  const { control, setValue, watch } = useFormContext<FormValues>();
  
  // Если нужно отслеживать выбранный регион для чего-то еще
  // const currentRegion = watch("program.region");

  if (!isRegionAvailable) return null;

  return (
    <Show when={isRegionAvailable}>
      <CardLayout
        title="Регион"
        avatarSlot={<AvatarMrm size="46" src={ASSETS.PRODUCTS.DMS.FLAG} />}
      >
        <div className={styles.field}>
          <Controller
            control={control}
            name="program.region"
            rules={{ required: "Необходимо выбрать регион" }}
            render={({ field, fieldState }) => (
              <AutoComplete<Program> // Указываем дженерик, если ваш компонент это поддерживает
                options={regions}
                // Передаем выбранное значение. Смотря что ждет ваш AutoComplete: объект или строку.
                // Если он ждет объект, передаем field.value (который равен { label, value })
                value={field.value}
                onChange={(option) => {
                  // option здесь — это элемент из массива regions, то есть { label, value: Program }
                  // В форму мы сохраняем именно Program (или весь объект option, смотря как валидирует Zod)
                  field.onChange(option?.value || null); 
                }}
                inputProps={{
                  required: true,
                  label: "Регион обслуживания",
                  textError: fieldState.error?.message,
                  // Для отображения в инпуте берем label из выбранного объекта
                  value: field.value?.label || "", 
                }}
                // Если AutoComplete требует отдельный пропс для текста инпута
                // inputValue={field.value?.label || ""} 
              />
            )}
          />
        </div>

        <div className={styles.popularRegions}>
          {popularRegions.map(({ label }) => (
            <Chip
              key={label}
              size={32}
              variant="secondary"
              onClick={() => {
                // Находим полный объект региона по лейблу, чтобы сохранить в форму корректные данные
                const foundRegion = regions.find(r => r.label === label);
                if (foundRegion) {
                  setValue("program.region", foundRegion.value, { 
                    shouldValidate: true, 
                    shouldDirty: true 
                  });
                }
              }}
            >
              {label}
            </Chip>
          ))}
        </div>
      </CardLayout>
    </Show>
  );
};