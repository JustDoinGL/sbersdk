import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Отправка запроса при закрытии вкладки
      fetch('/api/log-close', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'tab_close',
          timestamp: new Date().toISOString()
        }),
        // Важно: keepalive гарантирует отправку даже при закрытии страницы
        keepalive: true
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Очистка при размонтировании компонента
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div>Ваше приложение</div>
  );
}

export default App;