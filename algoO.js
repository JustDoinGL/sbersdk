import { useRef, useEffect, useState } from "react";
import { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import "swiper/css";

type TTopOffersProps = {
  id?: string;
  title?: string;
  items?: any[];
  className?: string;
};

export const TopOffers = ({
  id = "TopOffers",
  title,
  items,
  className,
}: TTopOffersProps) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxScroll, setMaxScroll] = useState(0);
  const isScrolling = useRef(false);

  const { scrollY, scrollX } = useScroll({
    container: containerRef,
  });

  // Обновляем максимальное значение скролла
  useEffect(() => {
    if (!swiperRef.current) return;
    
    const updateMaxScroll = () => {
      if (!swiperRef.current) return;
      
      const swiper = swiperRef.current;
      const totalWidth = swiper.slides.reduce(
        (sum, slide) => sum + slide.swiperSlideSize + swiper.params.spaceBetween, 
        0
      );
      setMaxScroll(Math.max(0, totalWidth - swiper.width + swiper.params.spaceBetween));
    };

    updateMaxScroll();
    const observer = new ResizeObserver(updateMaxScroll);
    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, [items?.length]);

  // Синхронизируем скролл контейнера с позицией слайдера
  useMotionValueEvent(scrollY, "change", (latestY) => {
    if (!swiperRef.current || isScrolling.current) return;
    
    isScrolling.current = true;
    const clampedTranslate = Math.min(maxScroll, Math.max(0, swiperRef.current.getTranslate() - latestY * 0.5));
    swiperRef.current.setTranslate(-clampedTranslate);
    
    requestAnimationFrame(() => {
      isScrolling.current = false;
    });
  });

  useMotionValueEvent(scrollX, "change", (latestX) => {
    if (!swiperRef.current || isScrolling.current) return;
    
    isScrolling.current = true;
    const clampedTranslate = Math.min(maxScroll, Math.max(0, latestX));
    swiperRef.current.setTranslate(-clampedTranslate);
    
    requestAnimationFrame(() => {
      isScrolling.current = false;
    });
  });

  // Обработка колеса мыши
  useEffect(() => {
    const swiperEl = containerRef.current;
    if (!swiperEl) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!swiperRef.current) return;

      const deltaX = e.deltaX || 0;
      const deltaY = e.deltaY || 0;
      const delta = deltaX + deltaY * 0.5; // Комбинируем оба направления
      
      const currentTranslate = Math.abs(swiperRef.current.getTranslate());
      const newTranslate = Math.max(0, Math.min(maxScroll, currentTranslate + delta));
      
      swiperRef.current.setTranslate(-newTranslate);
    };

    swiperEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => swiperEl.removeEventListener("wheel", handleWheel);
  }, [maxScroll]);

  return (
    <div className={`top-offers-container ${className}`} id={id}>
      {title && <h2 className="top-offers-title">{title}</h2>}

      <div
        ref={containerRef}
        className="top-offers-wrapper"
        style={{
          overflow: "auto",
          position: "relative",
          width: "100%",
          height: "500px",
        }}
      >
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            // Инициализация максимального скролла
            const totalWidth = swiper.slides.reduce(
              (sum, slide) => sum + slide.swiperSlideSize + swiper.params.spaceBetween, 
              0
            );
            setMaxScroll(Math.max(0, totalWidth - swiper.width + swiper.params.spaceBetween));
          }}
          spaceBetween={20}
          slidesPerView="auto"
          resistanceRatio={0}
          style={{
            width: "auto",
            height: "100%",
            padding: "0 20px",
          }}
        >
          {(items || Array.from({ length: 15 })).map((item, index) => (
            <SwiperSlide
              key={index}
              style={{
                width: "200px",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                className="offer-card"
                style={{
                  background: `hsl(${index * 10}, 70%, 80%)`,
                  borderRadius: "16px",
                  padding: "20px",
                  width: "100%",
                  height: "80%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                }}
                onClick={() => console.log("Clicked item:", index)}
              >
                <h3>Offer #{index + 1}</h3>
                {items && items[index] && (
                  <p>{items[index].title || "Special offer"}</p>
                )}
                <button className="offer-button">View</button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};
