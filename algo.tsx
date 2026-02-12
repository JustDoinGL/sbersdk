ctrl={control}
render={({ field: { onBlur, ...field }, fieldState }) => {
    return (
        <div className={wrapperClassName}>
            <Input
                placeholder=""
                pattern="[АВЕКМНОРСТУХABEKMHOPCTYX]{1}\d{3}[АВЕКМНОРСТУХABEKMHOPCTYX]{2}\d{2,3}"
                value={field.value || ''}
                onChange={(e) => {
                    const value = e.target.value;
                    if (mask?.unmask) {
                        field.onChange(mask.unmask(value.trim()));
                    } else {
                        field.onChange(value);
                    }
                }}
                onBlur={(e) => {
                    const value = e.target.value;
                    if (mask?.unmask) {
                        field.onChange(mask.unmask(value.trim()));
                    }
                    onBlur();
                }}
            />
        </div>
    )
}}