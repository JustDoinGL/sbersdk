import React, { useRef, useEffect, useCallback } from 'react';

const MPMWithAdacta: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const refreshIframe = useCallback(() => {
    if (iframeRef.current) {
      // Правильный способ обновления iframe - сохраняем текущий src
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 10);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Проверяем, что нажата F5 (код 116) или Cmd/Ctrl + R
      if (event.keyCode === 116 || (event.ctrlKey && event.keyCode === 82)) {
        event.preventDefault();
        event.stopPropagation();
        
        // Обновляем iframe
        refreshIframe();
        return false;
      }
    };

    // Добавляем обработчик
    document.addEventListener('keydown', handleKeyDown);
    
    // Убираем обработчик при размонтировании
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [refreshIframe]);

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