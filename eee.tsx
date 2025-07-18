@import "tailwindcss";

html {
  scroll-snap-type: y mandatory;
}


-----

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
-------
  import React, { useRef, useState } from "react";
import { cardsData } from "./data";
import { Footer, Header } from "./Content";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useAnimation,
  useInView,
} from "motion/react";
import ScrollLinked from "./Scroll";

interface CardProps {
  number: number;
  bgColor: string;
  title: string;
  description: string;
  icon: string;
  scrollDirection: "down" | "up";
  setIsactive4: React.Dispatch<React.SetStateAction<boolean>>;
}

const Card: React.FC<CardProps> = (props) => {
  const {
    number,
    bgColor,
    title,
    description,
    icon,
    setIsactive4,
    scrollDirection,
  } = props;
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, {
    amount: 0.9,
  });

  React.useEffect(() => {
    if (isInView) {
      controls.start("visible");
      setIsactive4(number);
    } else {
      controls.start("hidden");
    }
  }, [controls, isInView]);

  const variants = {
    visible: {
      scale: [0.8, 0.9, 1],
    },
    hidden: {
      scale: [1, 0.9, 0.8],
    },
  };

  return (
    <motion.div
      className={`h-[100%] w-full ${bgColor} flex items-center justify-center p-4 snap-center`}
      id={number.toString()}
      initial="hidden"
      animate={controls}
      variants={variants}
      ref={ref}
      transition={{
        duration: 1,
      }}
    >
      <motion.div className="max-w-4xl w-full bg-white bg-opacity-90 rounded-2xl shadow-xl p-8 md:p-12">
        <div className="flex items-center mb-6">
          <div className="text-5xl font-bold text-gray-700 mr-4">{number}</div>
          <div className="text-4xl">{icon}</div>
        </div>
        <h2 className="text-4xl font-bold text-gray-800 mb-6">{title}</h2>
        <p className="text-xl text-gray-600 mb-8">{description}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Learn More
        </motion.button>
        {number === 4 && (
          <ScrollLinked
            setIsactive4={setIsactive4}
            scrollDirection={scrollDirection}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

const App: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: carouselRef });
  const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down");
  const [isActive4, setIsactive4] = useState(false);

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious();
    if (previous !== undefined) {
      const diff = current - previous;
      setScrollDirection(diff > 0 ? "down" : "up");
    }
  });

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100">
      <Header />

      <motion.main
        ref={carouselRef}
        style={{ overflowY: isActive4 ? "hidden" : "scroll" }}
        className="h-[100vh] w-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
      >
        {cardsData.map((card) => (
          <Card
            key={card.number}
            number={card.number}
            bgColor={card.bgColor}
            title={card.title}
            description={card.description}
            icon={card.icon}
            scrollDirection={scrollDirection}
            setIsactive4={setIsactive4}
          />
        ))}
      </motion.main>

      <Footer />
    </div>
  );
};

export default App;
