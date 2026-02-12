const inputRef = useRef(null);

// В onChange
onChange={(e) => {
    const input = e.target;
    const cursorPos = input.selectionStart;
    const oldValue = inputRef.current?.value || '';
    const newValue = input.value;
    
    if (mask?.unmask) {
        const unmasked = mask.unmask(newValue);
        field.onChange(unmasked);
        
        setTimeout(() => {
            if (inputRef.current) {
                let newCursorPos = cursorPos;
                
                // Определяем, был ли удален разделитель
                const oldChar = oldValue[cursorPos];
                const isDelimiter = oldChar && /[^0-9a-zA-Z]/.test(oldChar);
                
                if (newValue.length < oldValue.length) {
                    if (isDelimiter) {
                        // Если удалили разделитель, смещаем курсор на символ назад
                        newCursorPos = Math.max(0, cursorPos - 1);
                    } else {
                        // Если удалили цифру, оставляем курсор на месте
                        newCursorPos = cursorPos;
                    }
                    
                    // Дополнительная проверка для удаления с конца
                    if (cursorPos === oldValue.length) {
                        newCursorPos = newValue.length;
                    }
                } else if (newValue.length > oldValue.length) {
                    // При добавлении символа
                    newCursorPos = cursorPos + 1;
                }
                
                inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    } else {
        field.onChange(newValue);
    }
}}

value={mask?.mask ? mask.mask(field.value ?? '') : field.value}
ref={(ref) => {
    if (ref) {
        inputRef.current = ref;
        // Передаем ref дальше если нужно
        if (typeof ref === 'object' && field.ref) {
            field.ref(ref);
        }
    }
}}







return (
    <div className={wrapperClassName}>
        <Input
            {...rest}
            {...field}
            onBlur={(e) => {
                const value = e.target.value;
                if (mask?.unmask) {
                    field.onChange(mask.unmask(value.trim()));
                } else {
                    field.onChange(value);
                }
                onBlur();
            }}
            hasError={!IFieldState.error}
            onChange={(e) => {
                const input = e.target;
                const cursorPos = input.selectionStart; // Сохраняем позицию курсора
                const oldValue = input.value;
                const newValue = input.value;
                
                if (mask?.unmask) {
                    const unmasked = mask.unmask(newValue);
                    field.onChange(unmasked);
                    
                    // Восстанавливаем позицию курсора после обновления
                    setTimeout(() => {
                        if (input) {
                            // Рассчитываем новую позицию с учетом разделителей маски
                            let newCursorPos = cursorPos;
                            
                            // Если удаляли символ
                            if (newValue.length < oldValue.length) {
                                // Оставляем курсор на том же месте
                                newCursorPos = cursorPos;
                            }
                            // Если добавляли символ
                            else if (newValue.length > oldValue.length) {
                                // Сдвигаем курсор вперед
                                newCursorPos = cursorPos + 1;
                            }
                            
                            input.setSelectionRange(newCursorPos, newCursorPos);
                        }
                    }, 0);
                } else {
                    field.onChange(newValue);
                }
            }}
            value={mask?.mask ? mask.mask(field.value ?? '') : field.value}
            ref={(ref) => {
                // Сохраняем ref для доступа к input
                if (ref) {
                    inputRef.current = ref;
                }
            }}
        />
        {fieldState.error?.message && (
            <ErrorMessage message={errorMessage ?? fieldState.error?.message} />
        )}
    </div>
);


