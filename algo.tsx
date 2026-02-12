import { Input, InputProps } from "@sg/uikit";
import { useMaskito } from "@maskito/react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { ErrorMessage } from "./message";
import { useRef } from "react";

type Props<FormData extends FieldValues> = {
    control: Control<FormData>;
    name: Path<FormData>;
    mask?: {
        readonly mask: (v: string) => string;
        readonly unmask: (v: string) => string;
        readonly maskitoOptions?: any; // Опции для Maskito
    };
    wrapperClassname?: string;
    errorMessage?: string;
} & InputProps;

export const ControlledInputField = <FormData extends FieldValues>({
    control,
    mask,
    name,
    wrapperClassname,
    errorMessage,
    ...rest
}: Props<FormData>) => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Получаем опции для Maskito
    const maskitoOptions = mask?.maskitoOptions?.();
    
    // Хук из @maskito/react
    const maskitoRef = useMaskito({
        options: maskitoOptions,
        elementPredicate: (host) => host.querySelector('input') ?? host,
    });

    // Объединяем рефы
    const setRefs = (element: HTMLInputElement | null) => {
        if (element) {
            inputRef.current = element;
            maskitoRef(element);
        }
    };

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, onBlur, value, ref, ...field }, fieldState }) => {
                // Форматируем значение для отображения
                const displayValue = value && mask?.mask ? mask.mask(value) : "";
                
                // Обработчик ввода
                const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const rawValue = e.target.value;
                    
                    if (mask?.unmask) {
                        // Сохраняем в RHF значение без маски
                        const unmasked = mask.unmask(rawValue);
                        onChange(unmasked);
                    } else {
                        onChange(rawValue);
                    }
                };

                // Обработчик blur
                const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
                    const val = e.target.value;
                    
                    if (mask?.unmask) {
                        // Триммим и сохраняем без маски
                        const unmasked = mask.unmask(val.trim());
                        onChange(unmasked);
                    }
                    
                    // Вызываем оригинальный onBlur из RHF
                    onBlur();
                    
                    // Вызываем переданный onBlur если есть
                    if (rest.onBlur) {
                        rest.onBlur(e);
                    }
                };

                return (
                    <div className={wrapperClassname}>
                        <Input
                            {...rest}
                            {...field}
                            ref={(el: HTMLInputElement | null) => {
                                // Объединяем рефы
                                setRefs(el);
                                if (typeof ref === 'function') {
                                    ref(el);
                                }
                            }}
                            value={displayValue}
                            onInput={handleInput}
                            onBlur={handleBlur}
                            hasError={!!fieldState.error}
                        />
                        {fieldState.error?.message && (
                            <ErrorMessage message={errorMessage ?? fieldState.error.message} />
                        )}
                    </div>
                );
            }}
        />
    );
};



// masks.ts
import type { MaskitoOptions } from "@maskito/core";

export const masks = {
    licensePlate: {
        // Для отображения пользователю
        mask: (v: string): string => {
            const value = v.replace(/\s/g, '').toUpperCase();
            if (!value) return '';
            
            let result = value[0];
            if (value.length > 1) result += value.slice(1, 4);
            if (value.length > 4) result += ' ' + value.slice(4, 6);
            if (value.length > 6) result += ' ' + value.slice(6);
            
            return result;
        },
        // Для сохранения в RHF
        unmask: (v: string): string => v.replace(/\s/g, ''),
        // Опции для Maskito (управление курсором)
        maskitoOptions: (): MaskitoOptions => ({
            mask: /^[А-ЯA-Z0-9\s]{0,9}$/,
            preprocessors: [
                ({ elementState, data }) => ({
                    elementState: {
                        value: elementState.value.toUpperCase(),
                        selection: elementState.selection,
                    },
                    data: data.toUpperCase(),
                }),
            ],
        }),
    },
    
    departmentCode: {
        mask: (v: string): string => {
            const cleaned = v.replace(/[^\dA-Z]/gi, '').toUpperCase();
            if (cleaned.length <= 2) return cleaned;
            return cleaned.slice(0, 2) + '-' + cleaned.slice(2, 7);
        },
        unmask: (v: string): string => v.replace(/[^\dA-Z]/gi, '').toUpperCase(),
        maskitoOptions: (): MaskitoOptions => ({
            mask: /^[\dA-Z]{0,2}-?[\dA-Z]{0,5}$/i,
            preprocessors: [
                ({ elementState, data }) => ({
                    elementState: {
                        value: elementState.value.toUpperCase(),
                        selection: elementState.selection,
                    },
                    data: data.toUpperCase(),
                }),
            ],
        }),
    },
    
    phone: {
        mask: (v: string): string => {
            const cleaned = v.replace(/\D/g, '');
            if (!cleaned) return '';
            if (cleaned.length <= 1) return `+7 (${cleaned}`;
            if (cleaned.length <= 4) return `+7 (${cleaned.slice(1)}`;
            if (cleaned.length <= 7) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
            if (cleaned.length <= 9) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
            return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
        },
        unmask: (v: string): string => v.replace(/\D/g, ''),
        maskitoOptions: (): MaskitoOptions => ({
            mask: ['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/],
        }),
    },
};
