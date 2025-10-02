export const useFormStore = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const state = useSyncExternalStore(formStore.subscribe, formStore.getSnapshot);

  const methods = useForm<FormCrmData>({
    mode: 'onTouched',
    resolver: zodResolver(fromSchemaCrm)
  });

  const { watch, setValue } = methods;

  // Следим за изменением номера и синхронизируем
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'phoneNumber' || name === 'alternativePhone') {
        // Если изменился один номер, устанавливаем значение в другом поле
        if (name === 'phoneNumber' && value.phoneNumber) {
          setValue('alternativePhone', value.phoneNumber, { 
            shouldValidate: true,
            shouldDirty: false 
          });
        } else if (name === 'alternativePhone' && value.alternativePhone) {
          setValue('phoneNumber', value.alternativePhone, { 
            shouldValidate: true,
            shouldDirty: false 
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  // ... остальной код
};