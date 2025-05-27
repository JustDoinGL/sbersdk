import { useState, useEffect } from 'react';

export const useStatePixels = (thresholdPixels: number) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            setIsScrolled(scrollTop >= thresholdPixels);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Проверяем сразу при монтировании

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [thresholdPixels]);

    return isScrolled;
};