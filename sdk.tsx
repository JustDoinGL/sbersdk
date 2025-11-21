const timeoutRef = useRef<NodeJS.Timeout>();

const setDigitValue = (index: number, value: string) => {
    form.setValue("digits.$(index)", value, { shouldValidate: true });
    
    // Очищаем предыдущий таймер
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }
    
    const isValid = form.getValues("digits").every((el) => /^\d+$/.test(el));
    
    if (isValid) {
        // Устанавливаем новый таймер на 500ms (0.5 секунды)
        timeoutRef.current = setTimeout(() => {
            handleSendCode();
        }, 500);
    }
};

const handleSendCode = async () => {
    const code = form.getValues("digits").join("");

    try {
        const response = await api.act_methods.verifyCode({
            code,
            id: acts[0].id,
        });
        if (response.status === 200) {
            handleNextStep();
        }
    } catch {
        form.setError("root", {
            message: "Неверный код. Проверьте правильность и попробуйте ещё раз",
        });
    }
};

// Очистка при размонтировании компонента
useEffect(() => {
    return () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };
}, []);