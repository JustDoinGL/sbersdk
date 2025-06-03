import { useState, useCallback, useRef, useEffect } from 'react';

export function useIntersection() {
    const [isVisible, setIsVisible] = useState(false);
    const [isVisibleFilters, setIsVisibleFilters] = useState(false);
    const [isVisibleContainer, setIsVisibleContainer] = useState(false);
    const [isVisibleBlock, setIsVisibleBlock] = useState(false);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const observerContainerRef = useRef<IntersectionObserver | null>(null);
    const lastScrollY = useRef(0);
    const isScrollingDown = useRef(false);
    const rafId = useRef<number | null>(null);

    const updateVisibilityStates = useCallback(() => {
        setIsVisible(isVisibleContainer && !isVisibleBlock);
        setIsVisibleFilters(isScrollingDown.current && isVisibleContainer && !isVisibleBlock);
    }, [isVisibleContainer, isVisibleBlock]);

    const setRef = useCallback((element: HTMLElement | null) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        if (element) {
            const observer = new IntersectionObserver(([entry]) => {
                const isElementVisible = entry.isIntersecting;
                setIsVisibleBlock(isElementVisible);
                updateVisibilityStates();
            }, { threshold: 0.1 });

            observer.observe(element);
            observerRef.current = observer;
        }
    }, [updateVisibilityStates]);

    const setRefContainer = useCallback((element: HTMLElement | null) => {
        if (observerContainerRef.current) {
            observerContainerRef.current.disconnect();
            observerContainerRef.current = null;
        }

        if (element) {
            const observer = new IntersectionObserver(([entry]) => {
                const isContainerVisible = entry.isIntersecting;
                setIsVisibleContainer(isContainerVisible);
                updateVisibilityStates();
            }, { threshold: 0 });

            observer.observe(element);
            observerContainerRef.current = observer;
        }
    }, [updateVisibilityStates]);

    const handleScroll = useCallback(() => {
        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
        }

        rafId.current = requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;
            isScrollingDown.current = currentScrollY > lastScrollY.current;
            lastScrollY.current = currentScrollY;
            updateVisibilityStates();
        });
    }, [updateVisibilityStates]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
            }
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
            if (observerContainerRef.current) {
                observerContainerRef.current.disconnect();
            }
        };
    }, [handleScroll]);

    return {
        setRef,
        setRefContainer,
        isVisible,
        isVisibleFilters,
    } as const;
}