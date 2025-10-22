import React, { useState, useEffect, useRef } from 'react';

interface Props {
  getNewCode: () => void;
}

const useTimer = () => {
  const [timer, setTimer] = useState(60);
  const timerId = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    setTimer(60);
    
    if (timerId.current) {
      clearInterval(timerId.current);
    }

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
  };

  useEffect(() => {
    startTimer();

    return () => {
      if (timerId.current) {
        clearInterval(timerId.current);
      }
    };
  }, []);

  return { timer, startTimer };
};

export const SmsCodeButton: React.FC<Props> = ({ getNewCode }) => {
  const { timer, startTimer } = useTimer();

  const handleResendCode = () => {
    getNewCode();
    startTimer();
  };

  return (
    <button
      className={`sms-button ${timer === 0 ? 'active' : 'disabled'}`}
      onClick={handleResendCode}
      disabled={timer > 0}
    >
      {timer > 0 ? `Отправить повторно через ${timer}с` : 'Отправить код'}
    </button>
  );
};