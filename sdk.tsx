const refreshIframe = useCallback(() => {
  if (iframeRef.current) {
    // Добавляем временный параметр для принудительного обновления
    const url = new URL(iframeRef.current.src);
    url.searchParams.set('_refresh', Date.now().toString());
    iframeRef.current.src = url.toString();
  }
}, []);