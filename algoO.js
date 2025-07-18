import { motion, useScroll, useMotionValueEvent, animate } from "framer-motion";
import { 
  forwardRef, 
  useRef, 
  useImperativeHandle, 
  useCallback 
} from "react";

type SlideScrollerHandle = {
  scrollToSlide: (index: number) => void;
};

type SlideScrollerProps = {
  children: React.ReactNode;
  zoomFactor?: number;
  className?: string;
};

const SlideScroller = forwardRef<SlideScrollerHandle, SlideScrollerProps>(
  ({ children, zoomFactor = 0.3, className }, ref) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const slidesRef = useRef<HTMLElement[]>([]);
    const currentSlideIndex = useRef(0);

    const { scrollYProgress } = useScroll({ container: wrapperRef });

    const registerSlideRef = (index: number) => (el: HTMLElement | null) => {
      if (el) slidesRef.current[index] = el;
    };

    const scrollToSlide = useCallback((index: number) => {
      if (!wrapperRef.current || !slidesRef.current[index]) return;

      animate(
        wrapperRef.current.scrollTop,
        slidesRef.current[index].offsetTop,
        {
          type: "spring",
          damping: 30,
          stiffness: 300,
          onUpdate: (val) => {
            if (wrapperRef.current) wrapperRef.current.scrollTop = val;
          }
        }
      );
    }, []);

    useImperativeHandle(ref, () => ({ scrollToSlide }));

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
      if (!wrapperRef.current) return;

      const scrollTop = wrapperRef.current.scrollTop;
      const activeIndex = slidesRef.current.findIndex(
        (slide, i) => 
          scrollTop >= slide.offsetTop && 
          (i === slidesRef.current.length - 1 || scrollTop < slidesRef.current[i + 1].offsetTop)
      );

      if (activeIndex !== -1 && currentSlideIndex.current !== activeIndex) {
        currentSlideIndex.current = activeIndex;
      }

      slidesRef.current.forEach((slide) => {
        const delta = Math.min(
          1,
          Math.abs(scrollTop - slide.offsetTop) / slide.clientHeight
        );

        if (slide.firstElementChild) {
          const scale = 1 - delta * zoomFactor;
          animate(slide.firstElementChild, { scale }, { type: "spring" });

          const nextSibling = slide.firstElementChild.nextElementSibling;
          if (nextSibling) {
            const opacity = 1 - delta * 0.8;
            animate(nextSibling, { opacity }, { type: "spring" });
          }
        }
      });
    });

    return (
      <motion.div
        ref={wrapperRef}
        className={className}
        style={{ overflow: "auto", height: "100vh" }}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              ref: registerSlideRef(index),
            });
          }
          return child;
        })}
      </motion.div>
    );
  }
);

SlideScroller.displayName = "SlideScroller";

export default SlideScroller;