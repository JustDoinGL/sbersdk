// Добавьте этот хук в компонент формы или создайте отдельный компонент-синхронизатор
const useSyncPhoneFields = () => {
    const { control, setValue } = useFormContext();
    
    const phone1 = useWatch({ control, name: 'PhoneNumber' });
    const phone2 = useWatch({ control, name: 'PhoneNumber2' });

    React.useEffect(() => {
        if (phone1 && phone1 !== phone2) {
            setValue('PhoneNumber2', phone1, { 
                shouldValidate: true,
                shouldDirty: true 
            });
        }
    }, [phone1]);

    React.useEffect(() => {
        if (phone2 && phone2 !== phone1) {
            setValue('PhoneNumber', phone2, { 
                shouldValidate: true,
                shouldDirty: true 
            });
        }
    }, [phone2]);
};

// Используйте в вашем основном компоненте формы
const YourFormComponent = () => {
    useSyncPhoneFields();
    // ... остальной код формы
};