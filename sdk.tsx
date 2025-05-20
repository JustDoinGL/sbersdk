import { useEffect, useState, useRef } from 'react';
import { generatedUrl } from '../constants/qr-code';
import { Content } from '../constants/types';

interface UrlPair {
  qr: string;
  button: string;
}

const DEFAULT_ITERATIONS = 10;
const DEFAULT_INTERVAL = 1000;

// Функция для сравнения URL без временных параметров
const compareUrlsWithoutTempParams = (url1: string, url2: string) => {
  const cleanUrl = (url: string) => {
    const u = new URL(url);
    u.searchParams.delete('detectme'); // Удаляем временный параметр
    u.searchParams.delete('_t'); // И другие временные параметры, если есть
    return u.href;
  };

  return cleanUrl(url1) === cleanUrl(url2);
};

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

        const shouldUpdateQr = !compareUrlsWithoutTempParams(
          previousUrlsRef.current[index].qr,
          updatedQrUrl
        );

        const shouldUpdateButton = !compareUrlsWithoutTempParams(
          previousUrlsRef.current[index].button,
          updatedButtonUrl
        );

        if (shouldUpdateQr || shouldUpdateButton) {
          setQrValues(prev => {
            const updatedValues = [...prev];
            updatedValues[index] = {
              qr: shouldUpdateQr ? newQrUrl : prev[index].qr,
              button: shouldUpdateButton ? newButtonUrl : prev[index].button
            };
            previousUrlsRef.current = updatedValues;
            return updatedValues;
          });
        }

        // Обновляем ref без перерендера
        previousUrlsRef.current[index] = {
          qr: newQrUrl,
          button: newButtonUrl
        };

        iterationCount += 1;
        if (iterationCount >= iterations) {
          clearInterval(intervalId);
        }
      };

      const intervalId = setInterval(updateUrls, interval);
      return intervalId;
    });

    return () => intervals.forEach(clearInterval);
  }, [urls]);

  return qrValues;
};