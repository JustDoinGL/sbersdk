"use client";

import {
  animate,
  motion,
  MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { useEffect, useRef } from "react";

type TScrollLinked = {
  scrollDirection: "down" | "up";
  setIsactive4: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ScrollLinked({ scrollDirection, setIsactive4 }: TScrollLinked) {
  const ref = useRef(null);
  const { scrollXProgress } = useScroll({ container: ref });
  const maskImage = useScrollOverflowMask(scrollXProgress);
  const isTouchDevice = useRef(false);

  useMotionValueEvent(scrollXProgress, "change", (value) => {
    console.log(value)
    if (value === 0 || value === 1) {
      setIsactive4(false);
    }
  });

  useEffect(() => {
    // Устанавливаем скролл в максимальное положение после монтирования
    if (ref.current && scrollDirection === "up") {
      // Вычисляем максимальное значение скролла
      const maxScroll = ref.current.scrollWidth - ref.current.clientWidth;

      // Плавно прокручиваем до максимума
      ref.current.scrollTo({
        left: maxScroll,
        behavior: "auto", // или 'smooth' для анимированного скролла
      });

      // Альтернативно можно использовать motion-значение
      scrollXProgress.set(1); // 1 означает 100% прогресса скролла
    }
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      // Check if this is likely a touchpad event (deltaMode === 0 and small delta values)
      const isTouchpad = e.deltaMode === 0 && Math.abs(e.deltaY) < 50;

      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) || isTouchpad) {
        // e.preventDefault();
        // For touchpad, use smoother scrolling with smaller increments
        const multiplier = isTouchpad ? 1 : 2;
        element.scrollLeft += e.deltaY * multiplier;
      }
    };

    // Touch device detection
    const handleTouchStart = () => {
      isTouchDevice.current = true;
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    element.addEventListener("touchstart", handleTouchStart, { passive: true });

    return () => {
      element.removeEventListener("wheel", handleWheel);
      element.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  return (
    <div id="example">
      <motion.ul ref={ref} style={{ maskImage }}>
        <li style={{ background: "#ff0088" }}></li>
        <li style={{ background: "#dd00ee" }}></li>
        <li style={{ background: "#9911ff" }}></li>
        <li style={{ background: "#0d63f8" }}></li>
        <li style={{ background: "#0cdcf7" }}></li>
        <li style={{ background: "#8df0cc" }}></li>
      </motion.ul>
      <StyleSheet />
    </div>
  );
}

const left = `0%`;
const right = `100%`;
const leftInset = `20%`;
const rightInset = `80%`;
const transparent = `#0000`;
const opaque = `#000`;
function useScrollOverflowMask(scrollXProgress: MotionValue<number>) {
  const maskImage = useMotionValue(
    `linear-gradient(90deg, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})`
  );

  useMotionValueEvent(scrollXProgress, "change", (value) => {
    if (value === 0) {
      animate(
        maskImage,
        `linear-gradient(90deg, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})`
      );
    } else if (value === 1) {
      animate(
        maskImage,
        `linear-gradient(90deg, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${right}, ${opaque})`
      );
    } else if (
      scrollXProgress.getPrevious() === 0 ||
      scrollXProgress.getPrevious() === 1
    ) {
      animate(
        maskImage,
        `linear-gradient(90deg, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${rightInset}, ${transparent})`
      );
    }
  });

  return maskImage;
}

/**
 * ==============   Styles   ================
 */

function StyleSheet() {
  return (
    <style>{`
            #example {
              width: 100vw;
              max-width: 400px;
              position: relative;
            }

            #example #progress {
                position: absolute;
                top: -65px;
                left: -15px;
                transform: rotate(-90deg);
            }

            #example .bg {
                stroke: #0b1011;
            }

            #example #progress circle {
                stroke-dashoffset: 0;
                stroke-width: 10%;
                fill: none;
            }

            #progress .indicator {
                stroke: var(--accent);
            }

            #example ul {
                display: flex;
                list-style: none;
                height: 220px;
                overflow-x: scroll;
                padding: 20px 0;
                flex: 0 0 600px;
                margin: 0 auto;
                gap: 20px;
            }

            #example ::-webkit-scrollbar {
                height: 5px;
                width: 5px;
                background: #fff3;
                -webkit-border-radius: 1ex;
            }

            #example ::-webkit-scrollbar-thumb {
                background: var(--accent);
                -webkit-border-radius: 1ex;
            }

            #example ::-webkit-scrollbar-corner {
                background: #fff3;
            }

            #example li {
                flex: 0 0 200px;
                background: var(--accent);
            }

    `}</style>
  );
}



"use client";

import { motion } from "motion/react";
import { useRef } from "react";

function Image({ id }: { id: number }) {
  const ref = useRef(null);

  return (
    <section className="img-container">
      <div ref={ref}>
        <img src={`/photos/cityscape/${id}.jpg`} alt="A London skyscraper" />
      </div>
      <motion.h2
        // Hide until scroll progress is measured
        initial={{ visibility: "hidden" }}
        animate={{ visibility: "visible" }}
      >{`#00${id}`}</motion.h2>
    </section>
  );
}

export default function Parallax() {
  //   const { scrollYProgress } = useScroll();
  //   const scaleX = useSpring(scrollYProgress, {
  //     stiffness: 100,
  //     damping: 30,
  //     restDelta: 0.001,
  //   });

  return (
    <div id="example">
      {[1, 2, 3, 4, 5].map((image) => (
        <Image key={image} id={image} />
      ))}
      {/* <motion.div className="progress" style={{ scaleX }} /> */}
      <StyleSheet />
    </div>
  );
}

/**
 * ==============   Styles   ================
 */

function StyleSheet() {
  return (
    <style>{`
        html {
            scroll-snap-type: y mandatory;
        }

        .img-container {
            height: 100vh;
            scroll-snap-align: start;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
        }

        .img-container > div {
            width: 300px;
            height: 400px;
            margin: 20px;
            background: #f5f5f5;
            overflow: hidden;
        }

        .img-container img {
            width: 300px;
            height: 400px;
        }

        @media (max-width: 500px) {
            .img-container > div {
                width: 150px;
                height: 200px;
            }

            .img-container img {
                width: 150px;
                height: 200px;
            }
        }

        .img-container h2 {
            color: #8df0cc;
            margin: 0;
            font-family: "Azeret Mono", monospace;
            font-size: 50px;
            font-weight: 700;
            letter-spacing: -3px;
            line-height: 1.2;
            position: absolute;
            display: inline-block;
            top: calc(50% - 25px);
            left: calc(50% + 120px);
        }
    `}</style>
  );
}


@import "tailwindcss";

html {
  scroll-snap-type: y mandatory;
}
