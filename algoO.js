import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Функция для отправки данных при покидании страницы
    const sendCloseData = () => {
      const data = { 
        action: 'tab_close', 
        timestamp: new Date().toISOString() 
      };

      // Вариант 1: Использование Fetch с keepalive
      fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // При необходимости можно добавить заголовки, например, для авторизации
          // 'Authorization': 'Bearer YOUR_TOKEN'
        },
        body: JSON.stringify(data),
        keepalive: true // ⬅️ Запрос продолжится после закрытия страницы
      });

      // Вариант 2: Использование sendBeacon (альтернатива)
      // navigator.sendBeacon('/api/log', JSON.stringify(data));
    };

    // Обработчик для события beforeunload
    const handleBeforeUnload = () => {
      sendCloseData();
    };

    // Подписываемся на событие
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Отписываемся от события при размонтировании компонента
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Пустой массив зависимостей гарантирует, что эффект выполнится один раз

  return (
    <div>Содержимое вашего приложения</div>
  );
}

export default App;