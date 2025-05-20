import { useEffect, useState, useRef } from 'react';
import { generatedUrl } from '../constants/qr-code';
import { Content } from '../constants/types';

interface UrlPair {
  qr: string;
  button: string;
}

const DEFAULT_ITERATIONS = 10;
const DEFAULT_INTERVAL = 1000;

export const useQMath = (urls: Content[]) => {
  const [qrValues, setQrValues] = useState<UrlPair[]>(() =>
    urls.map(url => ({
      qr: generatedUrl(url.qr),
      button: generatedUrl(url.button)
    }))
  );

  const previousUrlsRef = useRef<UrlPair[]>(qrValues);

  useEffect(() => {
    const intervals = urls.map((url, index) => {
      let iterationCount = 0;
      const { iterations = DEFAULT_ITERATIONS, interval = DEFAULT_INTERVAL } = url.updateCookiesOptions || {};

      const updateUrls = () => {
        const newQrUrl = generatedUrl(url.qr);
        const newButtonUrl = generatedUrl(url.button);
        
        const updatedQrUrl = generatedUrl(url.qr, { onlyCookiesParams: true });
        const updatedButtonUrl = generatedUrl(url.button, { onlyCookiesParams: true });

        const currentQrUrl = new URL(previousUrlsRef.current[index].qr);
        const currentButtonUrl = new URL(previousUrlsRef.current[index].button);

        if (currentQrUrl.href !== updatedQrUrl.href || currentButtonUrl.href !== updatedButtonUrl.href) {
          setQrValues(prev => {
            const updatedValues = [...prev];
            updatedValues[index] = { qr: newQrUrl, button: newButtonUrl };
            previousUrlsRef.current = updatedValues; // Обновляем ref синхронно
            return updatedValues;
          });
        }

        // Обновляем URL без перерендера
        const newUrls = [...previousUrlsRef.current];
        newUrls[index] = {
          qr: newQrUrl,
          button: newButtonUrl
        };
        previousUrlsRef.current = newUrls;

        iterationCount += 1;
        if (iterationCount >= iterations) {
          clearInterval(intervalId);
        }
      };

      const intervalId = setInterval(updateUrls, interval);
      return intervalId;
    });

    return () => intervals.forEach(clearInterval);
  }, [urls]); // Зависимости только от urls

  return qrValues;
};