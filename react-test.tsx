import { useEffect } from 'react';

const useHorizontalScroll = () => {
  useEffect(() => {
    const transformScroll = (event) => {
      if (!event.deltaY) {
        return;
      }

      event.currentTarget.scrollLeft += event.deltaY + event.deltaX;
      event.preventDefault();
    };

    const element = document.scrollingElement || document.documentElement;
    element.addEventListener('wheel', transformScroll);

    return () => {
      element.removeEventListener('wheel', transformScroll);
    };
  }, []);
};

// Пример использования в компоненте:
const MyComponent = () => {
  useHorizontalScroll();
  
  return (
    <div style={{ overflowX: 'auto', width: '100vw', height: '100vh' }}>
      {/* Ваш контент с горизонтальным скроллом */}
    </div>
  );
};

export default MyComponent;