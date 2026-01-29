import React, { useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Типы для водителя
type DriverType = 'russia' | 'international';
type DrivingLicenseType = 'Российской Федерации';

interface Driver {
  id?: string;
  fullName: string;
  birthDate: string;
  licenseType: DrivingLicenseType;
  licenseSeriesNumber: string;
  experienceStartDate: string;
  changedLicense?: {
    licenseType: DrivingLicenseType;
    licenseSeriesNumber: string;
  };
}

interface FormData {
  driverOption: 'specific' | 'any';
  drivers: Driver[];
}

// Схема валидации Zod
const driverSchema = z.object({
  fullName: z.string().min(1, 'ФИО обязательно'),
  birthDate: z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, 'Дата в формате ДД.ММ.ГГГГ'),
  licenseType: z.literal('Российской Федерации'),
  licenseSeriesNumber: z.string().min(1, 'Серия и номер ВУ обязательны'),
  experienceStartDate: z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, 'Дата в формате ДД.ММ.ГГГГ'),
  changedLicense: z.object({
    licenseType: z.literal('Российской Федерации'),
    licenseSeriesNumber: z.string().min(1, 'Серия и номер ВУ обязательны'),
  }).optional(),
});

const formSchema = z.object({
  driverOption: z.enum(['specific', 'any']),
  drivers: z.array(driverSchema)
    .when('driverOption', {
      is: 'specific',
      then: (schema) => schema.min(1, 'Добавьте хотя бы одного водителя'),
      otherwise: (schema) => schema.max(0, 'При выборе "Любой водитель" не должно быть указанных водителей'),
    }),
});

type FormValues = z.infer<typeof formSchema>;

// Компонент водителя
const DriverForm: React.FC<{
  index: number;
  control: any;
  register: any;
  errors: any;
  remove: () => void;
}> = ({ index, control, register, errors, remove }) => {
  const [hasChangedLicense, setHasChangedLicense] = React.useState(false);

  return (
    <div className="driver-form" style={{ border: '1px solid #ccc', padding: '16px', margin: '16px 0' }}>
      <h3>Водитель {index + 1}</h3>
      
      <div>
        <label>ФИО *</label>
        <input
          {...register(`drivers.${index}.fullName`)}
          placeholder="Равушев Константин Олегович"
        />
        {errors.drivers?.[index]?.fullName && (
          <span style={{ color: 'red' }}>{errors.drivers[index].fullName.message}</span>
        )}
      </div>

      <div>
        <label>Дата рождения *</label>
        <input
          {...register(`drivers.${index}.birthDate`)}
          placeholder="21.10.1995"
        />
        {errors.drivers?.[index]?.birthDate && (
          <span style={{ color: 'red' }}>{errors.drivers[index].birthDate.message}</span>
        )}
      </div>

      <div>
        <label>Тип водительского удостоверения</label>
        <select {...register(`drivers.${index}.licenseType`)}>
          <option value="Российской Федерации">Российской Федерации</option>
        </select>
      </div>

      <div>
        <label>Серия и номер ВУ *</label>
        <input
          {...register(`drivers.${index}.licenseSeriesNumber`)}
          placeholder="1234 567890"
        />
        {errors.drivers?.[index]?.licenseSeriesNumber && (
          <span style={{ color: 'red' }}>{errors.drivers[index].licenseSeriesNumber.message}</span>
        )}
      </div>

      <div>
        <label>Дата начала стажа *</label>
        <input
          {...register(`drivers.${index}.experienceStartDate`)}
          placeholder="01.01.2015"
        />
        {errors.drivers?.[index]?.experienceStartDate && (
          <span style={{ color: 'red' }}>{errors.drivers[index].experienceStartDate.message}</span>
        )}
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            onChange={(e) => setHasChangedLicense(e.target.checked)}
          />
          Менялось водительское удостоверение
        </label>
        <p>Укажите данные предыдущего водительского удостоверения для более точного расчёта КБМ</p>
        
        {hasChangedLicense && (
          <>
            <div>
              <label>Тип предыдущего водительского удостоверения</label>
              <select {...register(`drivers.${index}.changedLicense.licenseType`)}>
                <option value="Российской Федерации">Российской Федерации</option>
              </select>
            </div>
            
            <div>
              <label>Серия и номер предыдущего ВУ *</label>
              <input
                {...register(`drivers.${index}.changedLicense.licenseSeriesNumber`)}
                placeholder="9876 543210"
              />
              {errors.drivers?.[index]?.changedLicense?.licenseSeriesNumber && (
                <span style={{ color: 'red' }}>
                  {errors.drivers[index].changedLicense.licenseSeriesNumber.message}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <button type="button" onClick={remove} style={{ color: 'red', marginTop: '16px' }}>
        Удалить водителя
      </button>
    </div>
  );
};

// Основной компонент формы
const VehicleDriverForm: React.FC = () => {
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      driverOption: 'specific',
      drivers: [
        {
          fullName: 'Равушев Константин Олегович',
          birthDate: '21.10.1995',
          licenseType: 'Российской Федерации',
          licenseSeriesNumber: '',
          experienceStartDate: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'drivers',
  });

  const driverOption = watch('driverOption');
  const drivers = watch('drivers');

  // Эффект для обработки изменения выбора типа водителя
  useEffect(() => {
    if (driverOption === 'any') {
      // При выборе "Любой водитель" удаляем всех водителей
      while (fields.length > 0) {
        remove(0);
      }
    } else if (driverOption === 'specific' && fields.length === 0) {
      // При выборе "Только указанные водители" добавляем одного по умолчанию
      append({
        fullName: '',
        birthDate: '',
        licenseType: 'Российской Федерации',
        licenseSeriesNumber: '',
        experienceStartDate: '',
      });
    }
  }, [driverOption, fields.length, append, remove]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log('Отправленные данные:', data);
    
    if (data.driverOption === 'specific') {
      console.log('Указанные водители:', data.drivers);
      // Отправка данных на сервер
      // api.submitDrivers(data.drivers);
    } else {
      console.log('Любой водитель');
      // Отправка на сервер с пустым массивом водителей
      // api.submitAnyDriver();
    }
  };

  const addDriver = () => {
    if (driverOption === 'specific') {
      append({
        fullName: '',
        birthDate: '',
        licenseType: 'Российской Федерации',
        licenseSeriesNumber: '',
        experienceStartDate: '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Кто сможет управлять транспортным средством?</h2>
      
      <div style={{ marginBottom: '24px' }}>
        <div>
          <label>
            <input
              type="radio"
              value="specific"
              {...register('driverOption')}
            />
            Только указанные водители
          </label>
        </div>
        
        <div>
          <label>
            <input
              type="radio"
              value="any"
              {...register('driverOption')}
            />
            Любой водитель
          </label>
        </div>
        
        {errors.driverOption && (
          <span style={{ color: 'red' }}>{errors.driverOption.message}</span>
        )}
      </div>

      {driverOption === 'specific' && (
        <>
          {fields.map((field, index) => (
            <DriverForm
              key={field.id}
              index={index}
              control={control}
              register={register}
              errors={errors}
              remove={() => remove(index)}
            />
          ))}
          
          {errors.drivers && typeof errors.drivers.message === 'string' && (
            <span style={{ color: 'red' }}>{errors.drivers.message}</span>
          )}
          
          <button type="button" onClick={addDriver} style={{ margin: '16px 0' }}>
            + Добавить водителя
          </button>
        </>
      )}

      <div style={{ margin: '24px 0' }}>
        <h3>Дополнительно</h3>
        <select>
          <option value="">Выбрать станцию технического обслуживания</option>
          {/* Опции СТО */}
        </select>
      </div>

      <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none' }}>
        Отправить
      </button>
    </form>
  );
};

export default VehicleDriverForm;