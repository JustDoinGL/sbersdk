
useEffect(() => {
  const handleBeforeUnload = (event) => {
    // Добавляем задержку чтобы успеть увидеть запрос в Network
    event.preventDefault();
    
    const data = {
      event: 'tab_close',
      timestamp: new Date().toISOString()
    };

    // Вариант 1: с console.log перед отправкой
    console.log('🔄 Отправка запроса при закрытии...');
    
    fetch('/api/log-close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true
    });

    // Вариант 2: с отправкой в тестовый эндпоинт
    fetch('https://httpbin.org/post', {
      method: 'POST',
      body: JSON.stringify(data),
      keepalive: true
    });

    // Принудительная задержка для тестирования
    const startTime = Date.now();
    while (Date.now() - startTime < 100) {
      // Ждем 100ms чтобы запрос успел отправиться
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, []);