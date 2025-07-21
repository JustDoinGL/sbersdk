import { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, FreeMode } from "swiper/modules";
import "swiper/css";

export default function VerticalToHorizontalScroll() {
  const swiperRef = useRef(null);
  const isScrolling = useRef(false);
  const startY = useRef(0);
  const startX = useRef(0);

  // Обработчик колеса мыши и тачпада
  useEffect(() => {
    const swiperEl = swiperRef.current?.swiper?.el;
    if (!swiperEl) return;

    const handleWheel = (e) => {
      if (!swiperRef.current?.swiper || isScrolling.current) return;

      e.preventDefault();
      const delta = e.deltaY || e.deltaX; // Учитываем и горизонтальный скролл (на случай тачпада)
      swiperRef.current.swiper.setTranslate(
        swiperRef.current.swiper.getTranslate() - delta
      );
    };

    swiperEl.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      swiperEl.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Обработчик touch-событий (для мобильных устройств)
  useEffect(() => {
    const swiperEl = swiperRef.current?.swiper?.el;
    if (!swiperEl) return;

    const handleTouchStart = (e) => {
      isScrolling.current = true;
      startY.current = e.touches[0].clientY;
      startX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      if (!isScrolling.current) return;

      e.preventDefault();
      const deltaY = e.touches[0].clientY - startY.current;
      const deltaX = e.touches[0].clientX - startX.current;

      // Если скроллим в основном по вертикали — блокируем дефолтное поведение
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        swiperRef.current.swiper.setTranslate(
          swiperRef.current.swiper.getTranslate() - deltaY
        );
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      isScrolling.current = false;
    };

    swiperEl.addEventListener("touchstart", handleTouchStart, { passive: false });
    swiperEl.addEventListener("touchmove", handleTouchMove, { passive: false });
    swiperEl.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      swiperEl.removeEventListener("touchstart", handleTouchStart);
      swiperEl.removeEventListener("touchmove", handleTouchMove);
      swiperEl.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <Swiper
        ref={swiperRef}
        direction="horizontal"
        slidesPerView="auto"
        freeMode={{ enabled: true, momentumRatio: 0.5 }} // Инерция при скролле
        mousewheel={{
          invert: false,
          forceToAxis: true,
        }}
        modules={[Mousewheel, FreeMode]}
        style={{ height: "100vh" }}
      >
        <SwiperSlide style={{ width: "100vw", height: "100vh", background: "red" }}>
          Slide 1
        </SwiperSlide>
        <SwiperSlide style={{ width: "100vw", height: "100vh", background: "blue" }}>
          Slide 2
        </SwiperSlide>
        <SwiperSlide style={{ width: "100vw", height: "100vh", background: "green" }}>
          Slide 3
        </SwiperSlide>
      </Swiper>
    </div>
  );
}