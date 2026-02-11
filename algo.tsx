// Маска для кода подразделения (формат: 123-456)
export const masks = {
  // ... другие маски
  
  departmentCode: {
    // Маска для форматирования ввода
    mask: (v: string): string => {
      // Удаляем все кроме цифр
      const cleaned = v.replace(/\D/g, '');
      
      // Форматируем: первые 3 цифры + тире + остальные цифры
      if (cleaned.length <= 3) {
        return cleaned;
      }
      
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}`;
    },
    
    // Очистка от форматирования (удаляем тире)
    unmask: (v: string): string => {
      return v.replace(/-/g, '');
    },
    
    // Очистка поля при событии
    clean: (e: React.ChangeEvent<HTMLInputElement>): void => {
      e.target.value = e.target.value.replace(/\D/g, '');
    }
  }
};

// Или отдельно, если хочешь зарегистрировать новую маску
export const departmentCodeMask = {
  mask: (v: string): string => {
    const cleaned = v.replace(/\D/g, '');
    
    if (cleaned.length <= 3) {
      return cleaned;
    }
    
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}`;
  },
  unmask: (v: string): string => v.replace(/-/g, ''),
  clean: (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.target.value = e.target.value.replace(/\D/g, '');
  }
};

// Регистрируем в словаре
registerMask('departmentCode', departmentCodeMask);

// Пример использования:
// const formatted = departmentCodeMask.mask('78765'); // "78-765"
// const formatted2 = departmentCodeMask.mask('123456'); // "123-456"
// const cleaned = departmentCodeMask.unmask('78-765'); // "78765"