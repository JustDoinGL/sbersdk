const inputRef = useRef(null);
const skipNextUpdateRef = useRef(false);
const lastCursorPosRef = useRef(0);

// В onChange
onChange={(e) => {
    const input = e.target;
    const cursorPos = input.selectionStart;
    const oldValue = inputRef.current?.value || '';
    const newValue = input.value;
    
    if (mask?.unmask) {
        // Сохраняем позицию до обновления
        lastCursorPosRef.current = cursorPos;
        
        // Получаем значение без маски
        const unmasked = mask.unmask(newValue);
        
        // Проверяем, это пользовательский ввод или программное обновление
        if (!skipNextUpdateRef.current) {
            field.onChange(unmasked);
            
            setTimeout(() => {
                if (inputRef.current) {
                    const maskedValue = mask.mask(unmasked);
                    let newCursorPos = lastCursorPosRef.current;
                    
                    // Корректируем позицию для разных случаев
                    if (newValue.length > oldValue.length) {
                        // Добавление символа
                        newCursorPos = Math.min(cursorPos + 1, maskedValue.length);
                    } else if (newValue.length < oldValue.length) {
                        // Удаление символа
                        newCursorPos = Math.min(cursorPos, maskedValue.length);
                    }
                    
                    // Проверяем, не стоим ли мы на разделителе
                    if (newCursorPos < maskedValue.length) {
                        const charAtPos = maskedValue[newCursorPos];
                        if (charAtPos && /[^0-9a-zA-Z]/.test(charAtPos)) {
                            // Если стоим на разделителе, перепрыгиваем
                            if (newValue.length > oldValue.length) {
                                newCursorPos = Math.min(newCursorPos + 1, maskedValue.length);
                            }
                        }
                    }
                    
                    inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
                }
                skipNextUpdateRef.current = false;
            }, 0);
        }
    } else {
        field.onChange(newValue);
    }
}}

// Отслеживаем все клавиши навигации
onKeyDown={(e) => {
    const navigationKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    
    if (navigationKeys.includes(e.key)) {
        // Даем событию клавиатуры обработаться
        setTimeout(() => {
            if (inputRef.current) {
                // Просто запоминаем позицию, не меняем её
                lastCursorPosRef.current = inputRef.current.selectionStart;
            }
        }, 0);
    }
}}

// Предотвращаем скачки при программном обновлении
onFocus={(e) => {
    if (inputRef.current) {
        lastCursorPosRef.current = inputRef.current.selectionStart;
    }
}}

value={mask?.mask ? mask.mask(field.value ?? '') : field.value}
ref={(ref) => {
    if (ref) {
        inputRef.current = ref;
        if (typeof ref === 'object' && field.ref) {
            field.ref(ref);
        }
    }
}}