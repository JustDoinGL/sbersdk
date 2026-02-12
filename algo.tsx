onChange={(e) => {
    const input = e.target;
    const cursorPos = input.selectionStart;
    const oldValue = inputRef.current?.value || '';
    const newValue = input.value;
    
    if (mask?.unmask) {
        const unmasked = mask.unmask(newValue);
        
        // Определяем действие пользователя
        const isAdding = newValue.length > oldValue.length;
        const isDeleting = newValue.length < oldValue.length;
        const isPaste = Math.abs(newValue.length - oldValue.length) > 1;
        
        field.onChange(unmasked);
        
        setTimeout(() => {
            if (inputRef.current) {
                let newCursorPos = cursorPos;
                
                if (isAdding && !isPaste) {
                    // Обычный ввод одного символа - двигаем на 1
                    newCursorPos = cursorPos + 1;
                } else if (isDeleting) {
                    // Удаление - остаемся на месте
                    newCursorPos = cursorPos;
                } else {
                    // Вставка или другое действие
                    newCursorPos = cursorPos;
                }
                
                // Проверяем, не попали ли на разделитель
                const currentChar = inputRef.current.value[newCursorPos];
                if (currentChar === ' ' || currentChar === '-') {
                    // Если попали на разделитель - ничего не делаем
                    // Просто оставляем курсор на разделителе
                }
                
                newCursorPos = Math.min(newCursorPos, inputRef.current.value.length);
                inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    } else {
        field.onChange(newValue);
    }
}}