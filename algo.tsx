import { useEffect, useRef, useState } from "react";
import styles from "../sms_step.module.css";

export default function SmsCodeButton() {
    const [timer, setTimer] = useState(60);
    const timerId = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        timerId.current = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    // Останавливаем таймер когда доходит до 0
                    if (timerId.current) {
                        clearInterval(timerId.current);
                        timerId.current = null;
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Функция очистки при размонтировании компонента
        return () => {
            if (timerId.current) {
                clearInterval(timerId.current);
            }
        };
    }, []); // Пустой массив зависимостей - эффект выполняется только при монтировании

    // Функция для повторной отправки кода
    const handleResendCode = () => {
        if (timer === 0) {
            // Сбрасываем таймер и запускаем заново
            setTimer(60);
            timerId.current = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        if (timerId.current) {
                            clearInterval(timerId.current);
                            timerId.current = null;
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };

    return (
        <button 
            className={`${styles.smsButton} ${timer === 0 ? styles.active : styles.disabled}`}
            onClick={handleResendCode}
            disabled={timer > 0}
        >
            {timer === 0 ? "Отправить код повторно" : `Повторная отправка через ${timer}с`}
        </button>
    );
}