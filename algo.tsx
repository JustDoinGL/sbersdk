return (
    <div className={wrapperClassName}>
        <Input
            {...rest}
            {...field}
            onBlur={(e) => {
                const value = e.target.value;
                if (mask?.unmask) {
                    field.onChange(mask.unmask(value.trim()));
                } else {
                    field.onChange(value);
                }
                onBlur();
            }}
            hasError={!IFieldState.error}
            onChange={(e) => {
                let value = e.target.value;
                
                if (mask?.unmask) {
                    const unmasked = mask.unmask(value);
                    
                    // Проверяем, было ли это удаление
                    if (value.length < e.target.defaultValue?.length) {
                        // При удалении используем unmasked значение напрямую
                        field.onChange(unmasked);
                    } else {
                        field.onChange(unmasked);
                    }
                } else {
                    field.onChange(value);
                }
            }}
            value={mask?.mask ? mask.mask(field.value ?? '') : field.value}
        />
        {fieldState.error?.message && (
            <ErrorMessage message={errorMessage ?? fieldState.error?.message} />
        )}
    </div>
);