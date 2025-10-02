import { useFormContext, useWatch } from 'react-hook-form';

const SyncFields = () => {
  const { control, setValue } = useFormContext();
  
  // Отслеживаем первое поле
  const phoneNumber = useWatch({
    control,
    name: 'PhoneNumber',
  });
  
  // Отслеживаем второе поле
  const phoneNumber2 = useWatch({
    control,
    name: 'PhoneNumber2',
  });

  // Синхронизация PhoneNumber -> PhoneNumber2
  React.useEffect(() => {
    if (phoneNumber && phoneNumber !== phoneNumber2) {
      setValue('PhoneNumber2', phoneNumber, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    }
  }, [phoneNumber, phoneNumber2, setValue]);

  // Синхронизация PhoneNumber2 -> PhoneNumber
  React.useEffect(() => {
    if (phoneNumber2 && phoneNumber2 !== phoneNumber) {
      setValue('PhoneNumber', phoneNumber2, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    }
  }, [phoneNumber, phoneNumber2, setValue]);

  return (
    <div>
      <input name="PhoneNumber" />
      <input name="PhoneNumber2" />
    </div>
  );
};