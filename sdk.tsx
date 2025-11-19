public getDtoTime(localeDate: string | Date): number | undefined {
    if (!localeDate) {
        return undefined;
    }

    if (localeDate instanceof Date) {
        // Создаем копию даты и обнуляем время в UTC
        const utcDate = new Date(Date.UTC(
            localeDate.getUTCFullYear(),
            localeDate.getUTCMonth(),
            localeDate.getUTCDate(),
            0, 0, 0, 0
        ));
        return Math.floor(utcDate.getTime() / 1000);
    }

    // Парсим строку формата "DD.MM.YYYY"
    const parts = localeDate.split(".");
    if (parts.length !== 3) {
        return undefined;
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Месяцы в Date от 0 до 11
    const year = parseInt(parts[2], 10);

    // Проверяем валидность чисел
    if (isNaN(day) || isNaN(month) || isNaN(year) || month < 0 || month > 11) {
        return undefined;
    }

    // Создаем дату с обнуленным временем в UTC
    const date = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

    // Дополнительная проверка валидности даты
    if (isNaN(date.getTime()) || 
        date.getUTCDate() !== day || 
        date.getUTCMonth() !== month || 
        date.getUTCFullYear() !== year) {
        return undefined;
    }

    return Math.floor(date.getTime() / 1000);
}

public getDateFromTimeDto(dtoTime: number): Date {
    return new Date(dtoTime * 1000);
}