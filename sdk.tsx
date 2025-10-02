import { useCallback, useEffect, useRef } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Для React Native
// import { useNavigate, useLocation } from 'react-router-dom'; // Для React Web

const useNavigationLogger = (screenName) => {
  // Для React Native
  const navigation = useNavigation();

  // Для React Web (раскомментировать при необходимости)
  // const navigate = useNavigate();
  // const location = useLocation();

  const sendLog = useCallback((message, type = 'info') => {
    // В реальном приложении здесь может быть отправка на сервер
    console.log(`[${type.toUpperCase()}] ${new Date().toISOString()}: ${message}`);
  }, []);

  // Логирование событий фокуса и потери фокуса (React Native)
  useFocusEffect(
    useCallback(() => {
      sendLog(`Экран "${screenName}" в фокусе`, 'navigation');

      return () => {
        sendLog(`Экран "${screenName}" потерял фокус`, 'navigation');
      };
    }, [screenName, sendLog])
  );

  // Логирование нажатия аппаратной кнопки "Назад" (Android, React Native)
  useEffect(() => {
    const backHandler = () => {
      sendLog(`Нажата кнопка "Назад" на экране "${screenName}"`, 'back_press');
      // Возврат false позволяет выполнить стандартное действие (закрыть экран)
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', backHandler);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backHandler);
    };
  }, [screenName, sendLog]);

  // Логирование программных переходов "Назад" (универсально)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      sendLog(`Запуск редиректа (действие: ${e.data.action.type}) с экрана "${screenName}"`, 'redirect');
    });

    return unsubscribe;
  }, [navigation, screenName, sendLog]);
};

export default useNavigationLogger;
