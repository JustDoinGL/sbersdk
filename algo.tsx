import { useState } from 'react';

function LicensePlateInput() {
  const [plate, setPlate] = useState('');
  
  const handleChange = (e) => {
    const value = e.target.value;
    
    // Разрешаем только буквы, цифры и пробел
    if (!/^[A-ZА-Яa-zа-я0-9\s]*$/.test(value)) return;
    
    // Форматируем
    let clean = value.toUpperCase().replace(/[^A-ZА-Я0-9]/g, '');
    let formatted = '';
    
    // Первая буква
    if (clean.length > 0) {
      formatted = clean[0];
    }
    
    // Три цифры
    if (clean.length > 1) {
      formatted += ' ' + clean.substring(1, 4);
    }
    
    // Две буквы
    if (clean.length >= 4) {
      formatted += ' ' + clean.substring(4, 6);
    }
    
    // Три цифры
    if (clean.length >= 6) {
      formatted += ' ' + clean.substring(6, 9);
    }
    
    setPlate(formatted);
  };
  
  return (
    <input
      type="text"
      value={plate}
      onChange={handleChange}
      placeholder="A 123 BC 456"
      maxLength={12}
      style={{ textTransform: 'uppercase' }}
    />
  );
}