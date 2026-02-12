import { Input, InputProps } from "@s/q/ukit";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { ErrorMessage } from "./message";
import { useRef, useLayoutEffect } from "react";

type Props<FormData extends FieldValues> = {
  control: Control<FormData>;
  name: Path<FormData>;
  mask?: {
    readonly mask: (v: string) => string;
    readonly unmask: (v: string) => string;
  };
  wrapperClassName?: string;
  errorMessage?: string;
} & InputProps;

export const ControlledInputField = <FormData extends FieldValues>({
  control,
  mask,
  name,
  wrapperClassName,
  errorMessage,
  ...rest
}: Props<FormData>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onBlur, ...field }, fieldState }) => {
        // ref на DOM-элемент инпута
        const inputRef = useRef<HTMLInputElement>(null);
        // храним последнюю известную позицию курсора
        const lastCaretRef = useRef<{ start: number; end: number } | null>(null);

        // Сохраняем позицию при любом взаимодействии с курсором (клик, выделение, стрелки)
        const handleCaretChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
          const input = e.currentTarget;
          lastCaretRef.current = {
            start: input.selectionStart ?? 0,
            end: input.selectionEnd ?? 0,
          };
        };

        // Восстанавливаем позицию после того, как React применит новое значение (с маской)
        useLayoutEffect(() => {
          const input = inputRef.current;
          if (!input || document.activeElement !== input) return;

          const { start, end } = lastCaretRef.current ?? {
            start: input.value.length,
            end: input.value.length,
          };

          // Корректируем позицию, если маска добавила/удалила символы слева от курсора
          // Для этого сравниваем предыдущее маскированное значение с текущим
          const prevMasked = field.value ? mask?.mask(field.value) ?? '' : '';
          const currentMasked = input.value;
          
          // Простейшая корректировка: если длина увеличилась, смещаем курсор вперёд на разницу
          // (более точный алгоритм см. ниже)
          let delta = 0;
          if (prevMasked.length < currentMasked.length) {
            delta = currentMasked.length - prevMasked.length;
          }
          
          const newStart = Math.min(start + delta, currentMasked.length);
          const newEnd = Math.min(end + delta, currentMasked.length);
          
          // Устанавливаем позицию
          input.setSelectionRange(newStart, newEnd);
        }, [field.value]); // сработает после каждого обновления значения

        // Преобразуем текущее значение формы (unmasked) в отображаемое с маской
        const displayValue = mask?.mask ? mask.mask(field.value ?? '') : field.value ?? '';

        return (
          <div className={wrapperClassName}>
            <Input
              {...rest}
              {...field}
              // Объединяем ref из field с нашим локальным ref
              ref={(node: HTMLInputElement | null) => {
                if (typeof field.ref === 'function') field.ref(node);
                else if (field.ref) field.ref.current = node;
                inputRef.current = node;
              }}
              // Сохраняем позицию при каждом изменении выделения, клике, нажатии клавиш
              onSelect={handleCaretChange}
              onClick={handleCaretChange}
              onKeyUp={handleCaretChange} // ловим перемещение стрелками
              value={displayValue}
              hasError={!!fieldState.error}
              onChange={(e) => {
                // 1. Сохраняем позицию курсора ДО изменения (важно!)
                const input = e.target;
                lastCaretRef.current = {
                  start: input.selectionStart ?? 0,
                  end: input.selectionEnd ?? 0,
                };

                // 2. Получаем «сырое» значение и убираем разделители
                const rawValue = e.target.value;
                const newUnmasked = mask?.unmask ? mask.unmask(rawValue) : rawValue;

                // 3. Обновляем состояние формы (unmasked)
                field.onChange(newUnmasked);
                
                // ВАЖНО: React обновит отображаемое значение через проп value,
                // и useLayoutEffect восстановит курсор
              }}
              onBlur={(e) => {
                // Здесь не нужно дополнительно менять значение — оно уже синхронизировано
                onBlur();
              }}
            />
            {errorMessage && <ErrorMessage message={errorMessage} />}
          </div>
        );
      }}
    />
  );
};