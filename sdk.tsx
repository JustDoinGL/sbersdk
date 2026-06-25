import { useEffect, useRef, useState } from 'react';

const useAutoPlayVideo = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const playedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || playedRef.current) return;

    const tryPlay = async () => {
      if (playedRef.current) return;

      try {
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        
        await video.play();
        playedRef.current = true;
        setIsPlaying(true);
        
        // Очищаем обработчик после успешного запуска
        document.removeEventListener('click', onUserInteraction, true);
      } catch {
        // Ничего не делаем, ждём клика
      }
    };

    const onUserInteraction = (e: Event) => {
      if (e.isTrusted && !playedRef.current) {
        tryPlay();
      }
    };

    // Первая попытка
    tryPlay();

    // Единственный надёжный обработчик для iOS
    document.addEventListener('click', onUserInteraction, true);

    return () => {
      document.removeEventListener('click', onUserInteraction, true);
    };
  }, [videoRef]);

  return isPlaying;
};

export default useAutoPlayVideo;
