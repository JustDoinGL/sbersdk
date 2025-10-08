import React, { useRef, useEffect } from 'react';

const MPMWithAdacta = () => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Проверяем, что нажата F5 (код 116) или Cmd/Ctrl + R
      if (event.keyCode === 116 || (event.ctrlKey && event.keyCode === 82)) {
        event.preventDefault();
        event.stopPropagation();
        
        // Обновляем iframe
        if (iframeRef.current) {
          iframeRef.current.src = iframeRef.current.src;
        }
        return false;
      }
    };

    // Добавляем обработчик
    document.addEventListener('keydown', handleKeyDown);
    
    // Убираем обработчик при размонтировании
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div>
      <h1>MPM Application</h1>
      <iframe
        ref={iframeRef}
        src="https://your-adacta-url.com"
        width="100%"
        height="600px"
        title="Adacta"
      />
    </div>
  );
};

export default MPMWithAdacta;