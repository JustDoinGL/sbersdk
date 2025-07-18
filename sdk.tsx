import { motion, useScroll, useTransform, animate } from "framer-motion";
import { useCallback, useRef, useEffect } from "react";

interface SlideScrollerProps {
  children: React.ReactNode;
  segment?: number;
  zoomFactor?: number;
  className?: string;
}

const SlideScroller = ({
  children,
  segment,
  zoomFactor = 0.3,
  className,
}: SlideScrollerProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const currentSlideRef = useRef(0);
  const { scrollYProgress } = useScroll({
    container: wrapperRef,
  });

  // Получаем все слайды
  const slides = Array.from(wrapperRef.current?.querySelectorAll("section") || []);

  // Обработчик скролла
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (!wrapperRef.current) return;

      // Находим текущий слайд
      const scrollTop = wrapperRef.current.scrollTop;
      const startIndex = slides.findIndex(
        (slide, i) =>
          scrollTop >= slide.offsetTop &&
          (i === slides.length - 1 || scrollTop < slides[i + 1].offsetTop)
      );

      // Обновляем текущий слайд
      if (startIndex !== -1 && currentSlideRef.current !== startIndex) {
        currentSlideRef.current = startIndex;
        // Здесь можно обновить сегмент, если нужно
      }

      // Анимация для текущего и следующего слайда
      slides.forEach((slide, i) => {
        const delta = Math.min(
          1,
          Math.abs(scrollTop - slide.offsetTop) / slide.clientHeight
        );

        if (i !== slides.length - 1) {
          const scale = 1 - delta * zoomFactor;
          animate(slide.firstElementChild, { scale }, { type: "spring" });
        }

        // Анимация opacity для следующих элементов
        const nextSibling = slide.firstElementChild?.nextElementSibling;
        if (nextSibling) {
          const opacity = 1 - delta;
          animate(nextSibling, { opacity }, { type: "spring" });
        }
      });
    });

    return () => unsubscribe();
  }, [scrollYProgress, slides, zoomFactor]);

  return (
    <motion.div
      ref={wrapperRef}
      className={className}
      style={{ overflow: "auto", height: "100vh" }}
    >
      {children}
    </motion.div>
  );
};

export default SlideScroller;