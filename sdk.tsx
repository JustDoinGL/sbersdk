import React, { useRef, useEffect, useCallback, useState } from 'react';

const MPMWithAdacta: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);

  const isRefreshKey = (event: KeyboardEvent): boolean => {
    // Проверяем по физическому расположению клавиши (code) - самый надежный способ
    const isRKey = event.code === 'KeyR';
    
    // Проверяем по символам в разных раскладках (lowercase и uppercase)
    const refreshKeys = [
      'r', 'R',           // Английский
      'к', 'К',           // Русский
    ];
    
    return isRKey || refreshKeys.includes(event.key);
  };

  const softRefresh = useCallback(() => {
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 10);
    }
  }, []);

  const hardRefresh = useCallback(() => {
    setIframeKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isF5 = event.key === 'F5' || event.code === 'F5';
      const isRefreshKeyPressed = isRefreshKey(event);
      const isCtrl = event.ctrlKey || event.metaKey;
      
      if (isF5 || (isCtrl && isRefreshKeyPressed && !event.shiftKey)) {
        event.preventDefault();
        event.stopPropagation();
        softRefresh();
      } else if (isCtrl && event.shiftKey && isRefreshKeyPressed) {
        event.preventDefault();
        event.stopPropagation();
        hardRefresh();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [softRefresh, hardRefresh]);

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