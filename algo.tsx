export type Props = ReadProps | FormProps;

export const getPluralPeriod = (value: number) => {
    // Для получения правильных порядковых числительных 
    // нужно обрабатывать каждый случай отдельно
    const ordinals: Record<number, string> = {
        1: "Первый",
        2: "Второй", 
        3: "Третий",
        4: "Четвёртый",
        5: "Пятый",
        6: "Шестой",
        7: "Седьмой",
        8: "Восьмой",
        9: "Девятый",
        10: "Десятый"
        // и так далее...
    };
    
    return ordinals[value] || `${value}-й`;
};