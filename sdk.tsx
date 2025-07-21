import { useRef, useState, useEffect } from 'react';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useScroll, useMotionValueEvent, motion } from 'framer-motion';
import 'swiper/css';

const TopOffers = ({ id = 'TopOffers', title, items, className }: TTopOffersProps) => {
    const swiperRef = useRef<SwiperType | null>(null);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Настройка useScroll для контейнера Swiper
    const { scrollX } = useScroll({
        container: containerRef,
    });

    // Синхронизация скролла Motion с Swiper
    useMotionValueEvent(scrollX, 'change', (latest) => {
        if (!swiperRef.current) return;
        swiperRef.current.setTranslate(-latest);
    });

    // Обработчик колеса мыши для плавного скролла
    useEffect(() => {
        const swiperEl = containerRef.current;
        if (!swiperEl) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (!swiperRef.current) return;

            const delta = e.deltaY || e.deltaX;
            const newTranslate = swiperRef.current.getTranslate() + delta;
            swiperRef.current.setTranslate(newTranslate);
        };

        swiperEl.addEventListener('wheel', handleWheel, { passive: false });
        return () => swiperEl.removeEventListener('wheel', handleWheel);
    }, []);

    return (
        <motion.div 
            ref={containerRef} 
            className={`top-offers ${className}`}
            style={{ overflow: 'hidden' }}
        >
            <Swiper
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                onSlideChange={(swiper) => setActiveSlideIndex(swiper.activeIndex)}
                spaceBetween={20}
                slidesPerView="auto"
                freeMode={true} // Для плавного скролла без привязки к слайдам
            >
                {items.map((item, index) => (
                    <SwiperSlide key={index}>
                        <motion.div
                            animate={{
                                scale: activeSlideIndex === index ? 1.05 : 1,
                                opacity: activeSlideIndex === index ? 1 : 0.7,
                            }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            {/* Ваш контент слайда */}
                            {item}
                        </motion.div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </motion.div>
    );
};