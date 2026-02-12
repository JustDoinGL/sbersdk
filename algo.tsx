// license_plate
mask: (v: string): string => {
    const value = v.replace(/\s/g, '').toUpperCase();
    
    if (!value) return '';
    
    // Форматируем без пробелов внутри сегментов
    let result = value[0];
    
    if (value.length > 1) {
        result += value.slice(1, 4);
    }
    
    if (value.length > 4) {
        result += ' ' + value.slice(4, 6);
    }
    
    if (value.length > 6) {
        result += ' ' + value.slice(6);
    }
    
    return result;
},

// departmentCode
departmentCode: {
    mask: (v: string): string => {
        // Удаляем все лишние символы
        const cleaned = v.replace(/[^\dA-Za-z]/g, '').toUpperCase();
        
        if (cleaned.length <= 2) {
            return cleaned;
        }
        
        // Форматируем с одним дефисом
        return cleaned.slice(0, 2) + '-' + cleaned.slice(2, 7);
    },
    unmask: (v: string): string => v.replace(/[^\dA-Za-z]/g, '')
}




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
                
                // Корректируем позицию относительно разделителей
                if (newValue.length > oldValue.length) {
                    // При вводе - пропускаем разделители
                    while (inputRef.current.value[newCursorPos] === ' ' || 
                           inputRef.current.value[newCursorPos] === '-') {
                        newCursorPos++;
                    }
                }
                
                newCursorPos = Math.min(newCursorPos, inputRef.current.value.length);
                inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    } else {
        field.onChange(newValue);
    }
}}
