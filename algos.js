function handleNumberInput(inputString) {
    // Убираем все нецифровые символы кроме минуса
    const cleaned = inputString.replace(/[^\d-]/g, '');
    
    // Преобразуем в число
    let number = parseInt(cleaned);
    
    // Если не число или NaN, возвращаем 0
    if (isNaN(number)) {
        return 0;
    }
    
    // Возвращаем абсолютное значение
    return Math.abs(number);
}