import React, { useRef, useEffect, useState } from 'react';

export const SmsCodeForm = ({ onCodeSubmit }) => {
  const refs = useRef([]);
  const [vals, setVals] = useState(Array(6).fill(''));

  useEffect(() => {
    const code = vals.join('');
    if (code.length === 6) onCodeSubmit(code);
  }, [vals]);

  const paste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const newVals = [...Array(6).fill('')];
    digits.forEach((d, i) => { newVals[i] = d; refs.current[i] && (refs.current[i].value = d); });
    setVals(newVals);
    setTimeout(() => refs.current[Math.min(digits.length, 5)]?.focus(), 0);
  };

  const input = (index, e) => {
    const digit = e.currentTarget.value.replace(/\D/g, '').slice(-1);
    const newVals = [...vals];
    newVals[index] = digit;
    e.currentTarget.value = digit;
    setVals(newVals);
    digit && index < 5 && setTimeout(() => refs.current[index + 1]?.focus(), 0);
  };

  const keydown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!vals[index] && index > 0) {
        const newVals = [...vals];
        newVals[index - 1] = '';
        refs.current[index - 1] && (refs.current[index - 1].value = '');
        setVals(newVals);
        setTimeout(() => refs.current[index - 1]?.focus(), 0);
      }
    }
    e.key.length === 1 && !/\d/.test(e.key) && e.preventDefault();
  };

  return (
    <div className="sms-inputs-container">
      {vals.map((_, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          onPaste={paste}
          onInput={(e) => input(i, e)}
          onKeyDown={(e) => keydown(i, e)}
          onFocus={e => e.target.select()}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};