import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';

interface FormData {
  name: string;
  email: string;
  file: FileList;
}

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  // Первая мутация - загрузка файла/обработка данных
  const firstMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData, // FormData для файлов
      });
      return response.json();
    },
  });

  // Вторая мутация - создание записи с результатом первого запроса
  const secondMutation = useMutation({
    mutationFn: async (processedData: any) => {
      const response = await fetch('/api/create-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });
      return response.json();
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Создаем FormData для отправки файлов
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      if (data.file[0]) {
        formData.append('file', data.file[0]);
      }

      // Первый запрос - обработка и загрузка
      const firstResult = await firstMutation.mutateAsync(formData);
      
      // Сохраняем данные из первого запроса
      const processedData = {
        ...firstResult,
        originalName: data.name,
        timestamp: new Date().toISOString()
      };

      // Второй запрос - создание записи
      const secondResult = await secondMutation.mutateAsync(processedData);
      
      console.log('Финальный результат:', secondResult);
      
    } catch (error) {
      console.error('Ошибка при выполнении запросов:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input 
        {...register('name', { required: 'Имя обязательно' })} 
        placeholder="Имя"
      />
      {errors.name && <span>{errors.name.message}</span>}

      <input 
        {...register('email', { 
          required: 'Email обязателен',
          pattern: {
            value: /^\S+@\S+$/i,
            message: 'Неверный формат email'
          }
        })} 
        placeholder="Email"
      />
      {errors.email && <span>{errors.email.message}</span>}

      <input 
        type="file" 
        {...register('file', { required: 'Файл обязателен' })} 
      />
      {errors.file && <span>{errors.file.message}</span>}

      <button 
        type="submit" 
        disabled={firstMutation.isPending || secondMutation.isPending}
      >
        {firstMutation.isPending || secondMutation.isPending 
          ? 'Отправка...' 
          : 'Отправить'}
      </button>
    </form>
  );
}