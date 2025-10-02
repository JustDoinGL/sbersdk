import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Убери эти импорты, если не используешь react-router

const useNavigationLogger = (componentName = 'Unknown Component') => {
  const location = useLocation(); // Для react-router
  const navigate = useNavigate(); // Для react-router

  const sendLog = useCallback((message, type = 'info') => {
    // В реальном проекте здесь можно отправлять логи на сервер
    console.log(`[${type.toUpperCase()}] ${new Date().toISOString()}: [${componentName}] ${message}`);
  }, [componentName]);

  // Логирование изменений маршрута (для react-router)
  useEffect(() => {
    sendLog(`Переход на путь: ${location.pathname + location.search + location.hash}`, 'navigation');
  }, [location, sendLog]);

  // Логирование нажатия кнопки "назад" и других popstate-событий
  useEffect(() => {
    const handlePopState = (event) => {
      // event.state содержит состояние, переданное при pushState/replaceState
      sendLog(`Сработала кнопка "Назад" или "Вперед". Текущий URL: ${window.location.href}`, 'back_forward');
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [sendLog]);

  // Опционально: можно вернуть функцию для ручного логирования редиректов
  const logRedirect = useCallback((from, to) => {
    sendLog(`Редирект с ${from} на ${to}`, 'redirect');
  }, [sendLog]);

  return { logRedirect };
};

export default useNavigationLogger;
