export const useQMath = (options: any, urls: any[]) => {
    const [qrValues, setQrValues] = useState(urls.map(url => generatedUrl(url)));

    useEffect(() => {
        const intervals = urls.map((_, index) => {
            let count = 0;
            let oldUrl = new URL(qrValues[index]);

            const intervalId = setInterval(() => {
                const newUrl = generateUrl(urls[index]);
                const updatedUrl = generatedUrl(urls[index], { onlyCookiesParams: true });

                if (oldUrl.href !== updatedUrl.href) {
                    setQrValues(prev => {
                        const newValues = [...prev];
                        newValues[index] = newUrl;
                        return newValues;
                    });
                }

                oldUrl = new URL(newUrl);
                oldUrl.searchParams.delete('datetime');

                if (count >= options.iterations) {
                    clearInterval(intervalId);
                }
                count += 1;
            }, options.interval);

            return intervalId;
        });

        return () => intervals.forEach(intervalId => clearInterval(intervalId));
    }, [urls, options.interval, options.iterations]);

    return qrValues;
};