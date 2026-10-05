import { ComponentProps } from "react";
import { FieldValues, useFormContext, useWatch } from "react-hook-form";

import { useDebounce } from "@/5_shared/hooks";
import {
  ControlledInputField,
  ControlledDictionarySelectBox,
} from "@/5_shared/ui";

import { useSearchVehicleDto } from "@/modules/products/domain/shared/hooks";

type FacetedFieldProps<FormData extends FieldValues> = Omit<
  ComponentProps<typeof ControlledInputField<FormData>>,
  "onChange"
>;

export const ControlledFacetedField = <
  FormData extends FieldValues,
>({
  name,
  ...props
}: FacetedFieldProps<FormData>) => {
  const form = useFormContext<FormData>();

  const value = useWatch({
    control: form.control,
    name,
  });

  const debouncedValue = useDebounce(value, 500);

  return (
    <ControlledInputField
      {...props}
      name={name}
      control={form.control}
      onChange={(event) => {
        form.setValue(name, event.target.value as FormData[typeof name], {
          shouldDirty: true,
          shouldValidate: true,
        });
      }}
    />
  );
};

type ModificationFieldProps<FormData extends FieldValues> = Omit<
  ComponentProps<typeof ControlledDictionarySelectBox<FormData>>,
  "options" | "onSelect"
> & {
  maker?: string;
  model?: string;
  yearOfProduction?: string | number;
  enginePower?: string | number;
  onVehicleFound?: (vehicle: unknown) => void;
};

export const ControlledModificationField = <
  FormData extends FieldValues,
>({
  maker,
  model,
  yearOfProduction,
  enginePower,
  onVehicleFound,
  ...props
}: ModificationFieldProps<FormData>) => {
  const form = useFormContext<FormData>();

  const hasAllFilters =
    Boolean(maker) &&
    Boolean(model) &&
    Boolean(yearOfProduction) &&
    Boolean(enginePower);

  const vehicleByModification = useSearchVehicleDto({
    filters: {
      maker,
      model,
      prod: yearOfProduction,
      enginePower_gt: enginePower,
    },
    groupKey: "modificationName",
    enabled: hasAllFilters,
  });

  const options = vehicleByModification.options ?? [];

  const firstOption = options[0];

  const handleSelect = (option: (typeof options)[number]) => {
    props.onSelect?.(option);

    const vehicleDto = options.find(
      (item) => item.value === option.value,
    )?.vehicleDto;

    if (vehicleDto) {
      onVehicleFound?.(vehicleDto);
    }
  };

  return (
    <ControlledDictionarySelectBox
      {...props}
      options={options}
      onSelect={handleSelect}
    />
  );
};