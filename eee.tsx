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
