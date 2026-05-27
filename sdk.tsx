import dayjs from 'dayjs';

/**
 * Проверяет, истекла ли указанная дата
 * @param dateString - Дата в строковом формате (ISO 8601)
 * @returns true - если дата истекла или невалидная, false - если дата валидна и еще не истекла
 */
function isExpired(dateString: string | null | undefined): boolean {
    // Обработка null, undefined или пустой строки
    if (!dateString || dateString.trim() === '') {
        console.warn('⚠️ Дата не передана или пустая');
        return true; // Считаем истекшей, так как данных нет
    }

    // Парсим дату
    const parsedDate = dayjs(dateString);
    
    // Проверяем, валидная ли дата
    if (!parsedDate.isValid()) {
        console.warn(`⚠️ Невалидная дата: ${dateString}`);
        return true; // Невалидную дату считаем истекшей
    }

    // Сравниваем с текущим моментом
    // true = истекла, false = еще актуальна
    return dayjs().isAfter(parsedDate);
}

// Альтернативный вариант с более строгой типизацией и кастомным поведением
type ValidationResult = {
    isExpired: boolean;
    isValid: boolean;
    message?: string;
};

function checkExpiration(dateString: string | null | undefined): ValidationResult {
    // Проверка на пустые значения
    if (!dateString || dateString.trim() === '') {
        return {
            isExpired: true,
            isValid: false,
            message: 'Дата не указана'
        };
    }

    const parsedDate = dayjs(dateString);
    
    // Проверка валидности даты
    if (!parsedDate.isValid()) {
        return {
            isExpired: true,
            isValid: false,
            message: `Невалидный формат даты: ${dateString}`
        };
    }

    const now = dayjs();
    const expired = now.isAfter(parsedDate);
    
    return {
        isExpired: expired,
        isValid: true,
        message: expired ? 'Срок истек' : 'Срок актуален'
    };
}

// Примеры использования:

// ✅ Нормальный случай
console.log(isExpired("2026-05-21T20:59:59Z")); // false (не истекла)

// ❌ Истекшая дата
console.log(isExpired("2020-01-01T00:00:00Z")); // true (истекла)

// ⚠️ Обработка ошибок
console.log(isExpired(null));        // true + warning
console.log(isExpired(""));          // true + warning
console.log(isExpired("не дата"));   // true + warning

// Расширенный вариант с деталями
const result = checkExpiration("2026-05-21T20:59:59Z");
if (!result.isValid) {
    console.error(`Ошибка: ${result.message}`);
} else if (result.isExpired) {
    console.log('Дата истекла');
} else {
    console.log('Дата актуальна');
}