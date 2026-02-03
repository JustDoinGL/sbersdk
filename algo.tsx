import type Props = ReadProps | FormProps;

export const getPluralPeriod = (value: number) => {
    const forms: Record<Intl.LDMLPluralRule, string> = {
        one: "первый",
        two: "второй", 
        few: "третий",
        many: "четвёртый",
        other: "пятый"
    };

    const pr = new Intl.PluralRules("ru-RU");

    return forms[pr.select(value)];
};