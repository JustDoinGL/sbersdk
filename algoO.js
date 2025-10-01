import { useHref } from "react-router-dom";

function YourComponent() {
  // Хук useHref генерирует полный URL на основе вашего маршрута
  const baseUrl = useHref("/your-path/:id");

  // Ваша функция, которая получает id
  const yourFunction = (receivedId) => {
    // Заменяем плейсхолдер :id на реальный id
    const finalUrl = baseUrl.replace(':id', receivedId);
    
    // Открываем URL в новой вкладке
    window.open(finalUrl, '_blank');
  };

  return (
    // Ваш JSX...
  );
}