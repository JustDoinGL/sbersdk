label={element.label ?? ''}
styleType={isMobile ? 'medium' : 'round'}
isWarning={!!errors[element.name]?.message}
onChange={(value) => {
  field.onChange(value);
  
  if (element.name === 'PhoneNumber') {
    setValue('PhoneNumber2', value, { 
      shouldValidate: true,  // Запускает валидацию
      shouldDirty: true,     // Помечает поле как "измененное"
      shouldTouch: true      // Помечает поле как "тронутое"
    });
  }
  
  if (element.name === 'PhoneNumber2') {
    setValue('PhoneNumber', value, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }
}}