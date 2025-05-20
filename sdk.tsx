import { useEffect, useState } from 'react';
import { generatedUrl } from '../constants/qr-code';
import { Content } from '../constants/types';

export const useQMath = (urls: Content[]) => {
    const [qrValues, setQrValues] = useState(
        urls.map(url => ({
            qr: generatedUrl(url.qr),
            button: generatedUrl(url.button)
        }))
    );

    useEffect(() => {
        const intervals = urls.map((url, index) => {
            let count = 0;
            let oldQrUrl = new URL(qrValues[index].qr);
            let oldButtonUrl = new URL(qrValues[index].button);

            const intervalId = setInterval(() => {
                const newQrUrl = generatedUrl(url.qr);
                const newButtonUrl = generatedUrl(url.button);
                
                const updatedQrUrl = generatedUrl(url.qr, { onlyCookiesParams: true });
                const updatedButtonUrl = generatedUrl(url.button, { onlyCookiesParams: true });

                if (oldQrUrl.href !== updatedQrUrl.href || oldButtonUrl.href !== updatedButtonUrl.href) {
                    setQrValues(prev => {
                        const newValues = [...prev];
                        newValues[index] = {
                            qr: newQrUrl,
                            button: newButtonUrl
                        };
                        return newValues;
                    });
                }

                oldQrUrl = new URL(newQrUrl);
                oldButtonUrl = new URL(newButtonUrl);
                oldQrUrl.searchParams.delete('detectme');
                oldButtonUrl.searchParams.delete('detectme');

                if (count >= url.updateCookiesOptions?.iterations || 10) {
                    clearInterval(intervalId);
                }
                count += 1;
            }, url.updateCookiesOptions?.interval || 1000);

            return intervalId;
        });

        return () => intervals.forEach(intervalId => clearInterval(intervalId));
    }, [urls]);

    return qrValues;
};