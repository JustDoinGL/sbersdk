import {
  dictionariesApi,
  PRODUCT,
  ProductCodeMap,
} from "@products/domain/shared/5_api";
import {
  MultiSelectProps,
  type Option,
  useToast,
} from "@sg/uikit";
import { useEffect, useState } from "react";
import { Control, FieldValues, Path } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import { ControlledMultiselect } from "@/5_shared/ui";

type Props<
  FormData extends FieldValues,
  T extends PRODUCT,
  K extends ProductCodeMap[T],
> = {
  control: Control<FormData>;
  name: Path<FormData>;
  wrapperClassName?: string;
  product: T;
  code: K;
} & Omit<MultiSelectProps<string>, "ref" | "options">;

export const DictionaryMultiselect = <
  FormData extends FieldValues,
  T extends PRODUCT,
  K extends ProductCodeMap[T],
>({
  product,
  code,
  ...rest
}: Props<FormData, T, K>) => {
  const { push } = useToast();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query]);

  const { data: options = [], isFetching } = useQuery({
    queryKey: ["dictionary", product, code, debouncedQuery],

    queryFn: async () => {
      const response = await dictionariesApi.searchDictionary(product, {
        code,
        query: debouncedQuery,
      });

      if (response.count === 0) {
        push({
          type: "info",
          title: "Элемент не найден",
        });

        return [];
      }

      return response.data;
    },

    enabled: Boolean(product),
  });

  return (
    <ControlledMultiselect
      {...rest}
      onInputChange={setQuery}
      onFocus={() => setQuery("")}
      options={options as Option<string>[]}
      loading={isFetching}
    />
  );
};