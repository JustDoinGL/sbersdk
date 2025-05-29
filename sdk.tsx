export function useIntersection(onIntersect: () => void) {
    const unsubscribe = useRef<() => void>();

    return useCallback((element: HTMLElement | null) => {
        if (element) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        onIntersect();
                    }
                });
            });

            observer.observe(element);
            unsubscribe.current = () => observer.disconnect();
        } else {
            unsubscribe.current?.();
        }
    }, [onIntersect]);
}