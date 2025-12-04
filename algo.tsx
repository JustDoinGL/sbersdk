public Bward(args: { isOptional: boolean }) {
    const baseSchema = z.string().transform((val) => {
        if (val === "" || val === null || val === undefined) {
            return undefined;
        }
        const num = Number(val);
        return Number.isNaN(num) ? undefined : num;
    });

    const numberSchema = z.number({
        message: "Неверный формат: только цифры, точка или запятая, максимум два знака после разделителя"
    })
    .min(1, { message: "Премия не может быть меньше 1" })
    .max(10000000, { message: "Премия не может быть больше 10 000 000" })
    .refine((v) => {
        if (!v) return true;
        const parts = v.toString().split(".");
        return parts[1] ? parts[1].length <= 2 : true;
    }, "Не более 2-х знаков после запятой")
    .transform((val) => String(val));

    // Если isOptional = true и значение undefined, не проваливаемся в pipe
    if (args.isOptional) {
        return baseSchema.pipe(
            z.union([
                z.undefined(),
                numberSchema
            ])
        );
    }
    
    // Если isOptional = false, всегда применяем валидацию
    return baseSchema.pipe(numberSchema);
}