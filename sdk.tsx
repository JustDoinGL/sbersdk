import React, { useRef, useEffect, useCallback, useState } from 'react';

const MPMWithAdacta: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);

  const refreshIframe = useCallback((hardRefresh: boolean = false) => {
    if (hardRefresh) {
      // Полная перезагрузка без кеша - пересоздаем iframe с новым ключом
      setIframeKey(prev => prev + 1);
    } else if (iframeRef.current) {
      // Обычное обновление
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
      const isF5 = event.key === 'F5' || event.code === 'F5';
      const isCtrlR = (event.ctrlKey || event.metaKey) && event.key === 'r';
      const isCtrlShiftR = (event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'r';
      
      if (isF5 || isCtrlR) {
        event.preventDefault();
        event.stopPropagation();
        refreshIframe(false); // Обычное обновление
      } else if (isCtrlShiftR) {
        event.preventDefault();
        event.stopPropagation();
        refreshIframe(true); // Полная перезагрузка без кеша
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [refreshIframe]);

  return (
    <div>
      <h1>MPM Application</h1>
      <iframe
        key={iframeKey}
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