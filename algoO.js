import { useRef, useState, useEffect } from "react";
import { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { useScroll, useMotionValueEvent, motion } from "framer-motion";
import "swiper/css";

type TTopOffersProps = {
  id?: string;
  title?: string;
  items?: any[];
  className?: string;
  direction?: "horizontal" | "vertical";
};

export const TopOffers = ({
  id = "TopOffers",
  title,
  items,
  className,
  direction = "horizontal",
}: TTopOffersProps) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxScroll, setMaxScroll] = useState(0);

  const { scrollX, scrollY } = useScroll({
    container: containerRef,
  });

  // Обновляем максимальное значение скролла при изменении размера или количества слайдов
  useEffect(() => {
    if (!swiperRef.current) return;
    
    const updateMaxScroll = () => {
      if (!swiperRef.current) return;
      
      const swiper = swiperRef.current;
      const isHorizontal = direction === "horizontal";
      
      // Размер контейнера
      const containerSize = isHorizontal 
        ? swiper.width 
        : swiper.height;
      
      // Общий размер всех слайдов с учетом промежутков
      const totalSize = isHorizontal
        ? swiper.slides.reduce((sum, slide) => sum + slide.swiperSlideSize + swiper.params.spaceBetween, 0)
        : swiper.slides.reduce((sum, slide) => sum + slide.swiperSlideSize + swiper.params.spaceBetween, 0);
      
      // Максимальный скролл - разница между общим размером и размером контейнера
      const newMaxScroll = Math.max(0, totalSize - containerSize);
      setMaxScroll(newMaxScroll);
    };

    updateMaxScroll();
    
    // Обновляем при ресайзе
    const observer = new ResizeObserver(updateMaxScroll);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [direction, items?.length]);

  useMotionValueEvent(scrollX, "change", (latest) => {
    if (!swiperRef.current || direction !== "horizontal") return;
    const clampedTranslate = Math.min(maxScroll, Math.max(0, latest));
    swiperRef.current.setTranslate(-clampedTranslate);
  });

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!swiperRef.current || direction !== "vertical") return;
    const clampedTranslate = Math.min(maxScroll, Math.max(0, latest));
    swiperRef.current.setTranslate(-clampedTranslate);
  });

  useEffect(() => {
    const swiperEl = containerRef.current;
    if (!swiperEl) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!swiperRef.current) return;

      const delta = direction === "horizontal" ? e.deltaY || e.deltaX : e.deltaY;
      const currentTranslate = Math.abs(swiperRef.current.getTranslate());
      let newTranslate = currentTranslate + delta * 0.5;

      // Ограничиваем скролл в пределах [0, maxScroll]
      newTranslate = Math.max(0, Math.min(maxScroll, newTranslate));

      swiperRef.current.setTranslate(-newTranslate);
    };

    swiperEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => swiperEl.removeEventListener("wheel", handleWheel);
  }, [direction, maxScroll]);

  return (
    <div className={`top-offers-container ${className}`} id={id}>
      {title && <h2 className="top-offers-title">{title}</h2>}

      <motion.div
        ref={containerRef}
        className="top-offers-wrapper"
        style={{
          overflow: "hidden",
          position: "relative",
          height: direction === "vertical" ? "500px" : "auto",
          width: "100%",
        }}
      >
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            // Инициализируем максимальный скролл после создания Swiper
            setTimeout(() => {
              const isHorizontal = direction === "horizontal";
              const containerSize = isHorizontal ? swiper.width : swiper.height;
              const totalSize = isHorizontal
                ? swiper.slides.reduce((sum, slide) => sum + slide.swiperSlideSize + swiper.params.spaceBetween, 0)
                : swiper.slides.reduce((sum, slide) => sum + slide.swiperSlideSize + swiper.params.spaceBetween, 0);
              setMaxScroll(Math.max(0, totalSize - containerSize));
            }, 100);
          }}
          onSlideChange={(swiper) => setActiveSlideIndex(swiper.activeIndex)}
          spaceBetween={20}
          slidesPerView="auto"
          freeMode={true}
          resistanceRatio={0}
          direction={direction}
          style={{
            height: direction === "vertical" ? "100%" : "300px",
            width: "100%",
            padding: "0 20px",
          }}
        >
          {(items || Array.from({ length: 100 })).map((item, index) => (
            <SwiperSlide
              key={index}
              style={{
                width: direction === "horizontal" ? "200px" : "100%",
                height: direction === "vertical" ? "150px" : "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <motion.div
                className="offer-card"
                animate={{
                  scale: activeSlideIndex === index ? 1.1 : 0.9,
                  opacity: activeSlideIndex === index ? 1 : 0.6,
                }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{
                  background: `hsl(${index * 10}, 70%, 80%)`,
                  borderRadius: "16px",
                  padding: "20px",
                  width: "100%",
                  height: direction === "vertical" ? "100%" : "80%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                }}
                whileHover={{ scale: 1.05 }}
                onClick={() => console.log("Clicked item:", index)}
              >
                <h3>Offer #{index + 1}</h3>
                {items && items[index] && (
                  <p>{items[index].title || "Special offer"}</p>
                )}
                <button className="offer-button">View</button>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </div>
  );
};
