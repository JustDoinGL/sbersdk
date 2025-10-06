
import { useEffect, useContext } from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";

const useBackListener = (callback) => {
  const navigator = useContext(UNSAFE_NavigationContext).navigator;

  useEffect(() => {
    // Создаем слушателя, который получает событие навигации
    const listener = ({ location, action }) => {
      // action может быть "PUSH", "POP" или "REPLACE"
      if (action === "POP") {
        callback({ location, action });
      }
    };
    
    // Подписываемся на события навигации
    const unlisten = navigator.listen(listener);
    
    // Отписываемся от событий при размонтировании компонента
    return unlisten;
  }, [callback, navigator]);
};