export const getPluralRecords = (value: number) => {
    const forms: Record<Intl.LDMLPluralRule, string> = {
        zero: "записей",
        one: "запись",
        two: "записи",
        few: "записи",
        many: "записей",
        other: "записей"
    };

    const pr = new Intl.PluralRules("ru-RU");
    return forms[pr.select(value)];
};