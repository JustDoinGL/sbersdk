import { FC } from "react";
import { getProductLabel } from "./getProductLabel";

// Определяем типы
interface ProductDto {
    id: number;
    adinsure_code: number | null;
    product_name: string;
    ui_name: string | null;
    insurance_type: number | null;
}

type Option<T> = {
    label: string;
    value: T;
    disabled?: boolean;
}

type Suggestion<T> = {
    label: string;
    value: number;
    original: T;
}

type Props = {
    onSelect: (dto: ProductDto | null | Option<string>) => void;
    hideLabel?: boolean;
    label?: string;
    selected?: ProductDto;
    inputProps?: InputProps;
};

// Правильный type guard
function isProductDto(dto: ProductDto | Option<string>): dto is ProductDto {
    return (
        dto !== null &&
        typeof dto === "object" &&
        "id" in dto &&
        "product_name" in dto &&
        typeof (dto as ProductDto).id === "number" &&
        typeof (dto as ProductDto).product_name === "string"
    );
}

export const ProductAutocomplete: FC<Props> = ({ 
    onSelect,
    hideLabel,
    label,
    selected,
    inputProps,
}) => {
    // Функция для преобразования в suggestion
    const toSuggestMapper = (dto: ProductDto | Option<string>): Suggestion<ProductDto | Option<string>> => {
        if (isProductDto(dto)) {
            return {
                label: getProductLabel(dto),
                value: dto.id,
                original: dto,
            };
        }
        
        // Для Option<string> создаем suggestion
        return {
            label: dto.label,
            value: -1, // или другое уникальное значение
            original: dto,
        };
    };

    const valueGetter = async (search: string) => {
        const response = await api.reference_methods.getProducts({
            search,
            has_ui_name: "true",
        });

        if (response.count > response.results.length) {
            return [
                ...response.results, 
                { 
                    label: "Уточните запрос", 
                    value: "clarify",
                    disabled: true 
                }
            ];
        }

        return response.results;
    };

    return (
        <Autocomplete
            placeholder="Выберите продукт"
            onSelect={onSelect}
            selected={selected}
            label={hideLabel ? undefined : label || "Продукт"}
            inputProps={inputProps}
            toSuggestMapper={toSuggestMapper}
            valueGetter={valueGetter}
        />
    );
};