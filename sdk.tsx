import { useMemo } from 'react';

// ... (остальные импорты)

export const ControlledModificationField = <FormData extends FieldValues>({
  // ... пропсы
}) => {
  // ... (предыдущие хуки)

  const hasAllFilters = Boolean(maker) && Boolean(model) && Boolean(yearOfProduction) && Boolean(enginePower);

  const vehicleByModification = useSearchVehicleDto({
    filters: {
      maker: maker,
      model: model,
      prod: yearOfProduction,
      enginePower_gt: enginePower,
    } as any, // Фикс ошибки типизации
    enabled: false,
    groupKey: "modificationName",
  });

  // Вся логика внутри useMemo
  useMemo(() => {
    const options = vehicleByModification.options;

    // Проверка, что опции есть
    if (!options) return;

    const keys = Object.keys(options);

    // Проверка, что ключи есть
    if (keys.length === 0) return;

    const firstKey = keys[0];
    const selectedVehicleDto = options[firstKey];

    console.log(options);

    // Устанавливаем значение в форму
    form.setValue("vehicle.modificationName", firstKey);

    // Вызываем колбэк
    if (onVehicleFound) {
      onVehicleFound(selectedVehicleDto);
    }

  }, [vehicleByModification.options, form, onVehicleFound]);

  const isLoading = vehicleByModification.loading || models.loading;

  return (
    <ControlledDictionarySelectBox
      label="Модификация"
      endIcon={isLoading ? <Spinner /> : undefined}
      size="xl"
      options={models.options}
      onSelect={(e) => {
        if (props.onSelect) props.onSelect(e);
        
        // Логика для ручного выбора
        const selectedKey = e.value;
        const options = vehicleByModification.options;
        
        if (selectedKey && options && options[selectedKey]) {
          form.setValue("vehicle.modificationName", selectedKey);
          if (onVehicleFound) onVehicleFound(options[selectedKey]);
        }
      }}
    />
  );
};