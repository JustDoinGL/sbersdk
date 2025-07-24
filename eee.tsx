import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

const LovelyBank = () => {
  const controls = useAnimation();
  const wrapperControls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (inView) {
      // Запускаем анимацию wrapper
      wrapperControls.start({
        opacity: [0, 1, 1, 1, 1, 0.9, 0],
        y: 0,
        transition: { delay: 1, duration: 1 }
      }).then(() => {
        // Когда wrapper достигает opacity 0.9, меняем позицию элементов
        controls.start({
          top: "100px",  // Новая позиция
          right: "50px",
          transition: { duration: 0.5 }
        });
      });
    }
  }, [inView, controls, wrapperControls]);

  return (
    <div ref={ref}>
      {/* Чёрный блок */}
      <motion.div
        animate={wrapperControls}
        initial={{
          y: 'calc(100% + 300px)',
          opacity: 0
        }}
        className="logo-wrapper"
        style={{
          width: 300,
          height: 300,
          background: 'black',
          position: 'relative'
        }}
      >
        {/* Элементы внутри */}
        <motion.div
          animate={controls}
          initial={{
            y: 'calc(100% + 350px)',
            opacity: 0,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          className="logo-element"
          style={{
            width: 100,
            height: 100,
            background: 'red'
          }}
        />
      </motion.div>
    </div>
  );
};