export const getPluralRecords = (
    value: number, 
    options?: { capitalizeFirstLetter?: boolean }
): string => {
    const forms: Record<Intl.LDMLPluralRule, string> = {
        zero: "записей выбрано",
        one: "запись выбрана",
        two: "записи выбрано",
        few: "записи выбрано",
        many: "записей выбрано",
        other: "записей выбрано"
    };
    
    const pr = new Intl.PluralRules("ru-RU");
    const pluralForm = pr.select(value);
    let result = forms[pluralForm];
    
    // Если нужно сделать первую букву заглавной
    if (options?.capitalizeFirstLetter) {
        result = result.charAt(0).toUpperCase() + result.slice(1);
    }
    
    return result;
};