import React, { useRef, useEffect, useCallback } from 'react';

const MPMWithAdacta: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const refreshIframe = useCallback(() => {
    if (iframeRef.current?.contentWindow?.location) {
      iframeRef.current.contentWindow.location.reload();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Современная проверка вместо keyCode
      const isF5 = event.key === 'F5' || event.code === 'F5';
      const isCtrlR = (event.ctrlKey || event.metaKey) && event.key === 'r';
      
      if (isF5 || isCtrlR) {
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