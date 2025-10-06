import { useNavigationType } from "react-router-dom";
import { useEffect } from "react";

function MyComponent() {
  const navigationType = useNavigationType();
  
  useEffect(() => {
    // Сработает при любой навигации, но только для типа POP (назад/вперед)
    if (navigationType === "POP") {
      console.log("Сработала навигация Назад/Вперед");
      // Вызов вашей функции
      myCustomFunction();
    }
  }, [navigationType]);
  
  return <div>Содержимое компонента</div>;
}