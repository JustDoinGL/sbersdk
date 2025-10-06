import { useNavigationType, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

export const useBackForwardListener = (callback: () => void) => {
  const navigationType = useNavigationType();
  const location = useLocation();
  const prevLocationKey = useRef(location.key);

  useEffect(() => {
    // Проверяем, что это навигация по истории и location изменился
    if (navigationType === "POP" && prevLocationKey.current !== location.key) {
      console.log("Сработала навигация Назад/Вперед", {
        previousKey: prevLocationKey.current,
        currentKey: location.key,
        pathname: location.pathname
      });
      
      // Вызываем переданную функцию
      callback();
      
      // Обновляем предыдущий ключ
      prevLocationKey.current = location.key;
    }
  }, [navigationType, location, callback]);
};

// Альтернативная версия с дополнительной информацией
export const useBackForwardListenerAdvanced = (callback: (location: any) => void) => {
  const navigationType = useNavigationType();
  const location = useLocation();
  const prevLocationKey = useRef(location.key);

  useEffect(() => {
    if (navigationType === "POP" && prevLocationKey.current !== location.key) {
      console.log("Навигация по истории:", {
        type: navigationType,
        from: prevLocationKey.current,
        to: location.key,
        fullLocation: location
      });
      
      // Передаем location в callback для большей гибкости
      callback(location);
      
      prevLocationKey.current = location.key;
    }
  }, [navigationType, location, callback]);
};