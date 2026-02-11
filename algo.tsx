export const AutostateNumberMask = (e: React.ChangeEvent<HTMLInputElement>) => {
  // 1. Убираем всё кроме букв и цифр
  let value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // 2. Ограничиваем длину (A123AA123 - 9 символов)
  if (value.length > 9) {
    value = value.slice(0, 9);
  }
  
  // 3. Форматируем по маске: X XXX XX XXX
  const parts = [];
  
  if (value.length > 0) {
    parts.push(value[0]); // Первая буква
  }
  
  if (value.length > 1) {
    parts.push(value.slice(1, Math.min(4, value.length))); // Три цифры
  }
  
  if (value.length > 4) {
    parts.push(value.slice(4, Math.min(6, value.length))); // Две буквы/цифры
  }
  
  if (value.length > 6) {
    parts.push(value.slice(6, 9)); // Три цифры
  }
  
  return parts.join(' ');
};

export const AutostateNumberInput = <FormData extends FieldValues>(props: Props<FormData>) => {
  const [plate, setPlate] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = AutostateNumberMask(e);
    setPlate(formatted);
  };
  
  return (
    <input
      type="text"
      value={plate}
      onChange={handleChange}
      placeholder="A 123 AA 123"
      maxLength={13} // 9 символов + 3 пробела
      className="your-styles"
    />
  );
};