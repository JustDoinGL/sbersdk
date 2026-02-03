export const getOrdinalNumber = (value: number) => {
    const lastDigit = value % 10;
    const lastTwoDigits = value % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return `${value}-й`;
    }
    
    switch (lastDigit) {
        case 1: return `${value}-й`;
        case 2: return `${value}-й`;
        case 3: return `${value}-й`;
        case 4: return `${value}-й`;
        default: return `${value}-й`;
    }
};

// Или полный вариант с прописью:
export const getOrdinalWord = (value: number) => {
    const ordinals = [
        "нулевой", "первый", "второй", "третий", "четвёртый", 
        "пятый", "шестой", "седьмой", "восьмой", "девятый", 
        "десятый", "одиннадцатый", "двенадцатый", "тринадцатый", 
        "четырнадцатый", "пятнадцатый", "шестнадцатый", 
        "семнадцатый", "восемнадцатый", "девятнадцатый", 
        "двадцатый"
    ];
    
    return ordinals[value] || `${value}-й`;
};