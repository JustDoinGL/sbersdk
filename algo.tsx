import { useController, UseControllerProps, FieldValues } from "react-hook-form";
import { Input, InputProps } from "@s/q/ukit";
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
  const {
    field: { value, onChange, onBlur, ref },
    fieldState,
  } = useController({
    control,
    name,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const lastCaretRef = useRef<{ start: number; end: number } | null>(null);

  // Сохраняем позицию курсора
  const handleCaretChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    lastCaretRef.current = {
      start: input.selectionStart ?? 0,
      end: input.selectionEnd ?? 0,
    };
  };

  // Корректируем позицию после применения маски
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input || document.activeElement !== input) return;

    const { start, end } = lastCaretRef.current ?? {
      start: input.value.length,
      end: input.value.length,
    };

    // Если маска изменила длину строки, нужно скорректировать позицию
    // Для простых масок можно использовать дельту, для сложных — специальный расчёт
    const currentMasked = input.value;
    const prevMasked = mask?.mask ? mask.mask(value) : value;
    let delta = 0;
    if (prevMasked.length < currentMasked.length) {
      delta = currentMasked.length - prevMasked.length;
    }

    const newStart = Math.min(start + delta, currentMasked.length);
    const newEnd = Math.min(end + delta, currentMasked.length);
    input.setSelectionRange(newStart, newEnd);
  }, [value, mask]);

  const displayValue = mask?.mask ? mask.mask(value ?? '') : value ?? '';

  return (
    <div className={wrapperClassName}>
      <Input
        {...rest}
        ref={(node: HTMLInputElement | null) => {
          // пробрасываем ref из react-hook-form и наш локальный ref
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
          inputRef.current = node;
        }}
        value={displayValue}
        hasError={!!fieldState.error}
        onSelect={handleCaretChange}
        onClick={handleCaretChange}
        onKeyUp={handleCaretChange}
        onChange={(e) => {
          // Сохраняем позицию до изменения
          const input = e.target;
          lastCaretRef.current = {
            start: input.selectionStart ?? 0,
            end: input.selectionEnd ?? 0,
          };

          const rawValue = e.target.value;
          const newUnmasked = mask?.unmask ? mask.unmask(rawValue) : rawValue;
          onChange(newUnmasked); // обновляем состояние формы
        }}
        onBlur={onBlur}
      />
      {errorMessage && <ErrorMessage message={errorMessage} />}
    </div>
  );
};