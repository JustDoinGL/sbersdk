import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import cx from 'classnames';
import { withBase } from 'your-path-helpers';

const CLASS_NAME = 'LovelyBank';

interface LovelyBankProps {
  id?: string;
  title: string;
  picture: string;
  images: Array<{ src: string }>;
  className?: string;
}

const LovelyBank = ({ id = 'LovelyBank', title, picture, images, className }: LovelyBankProps) => {
  const wrapperControls = useAnimation();
  const elementsControls = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      // Анимация появления wrapper
      await wrapperControls.start({
        opacity: [0, 0.3, 0.6, 0.9, 1],
        transition: { duration: 1 }
      });
      
      // Когда opacity достигает 0.9, запускаем вылет элементов
      await elementsControls.start("flyOut");
    };
    
    sequence();
  }, [wrapperControls, elementsControls]);

  return (
    <motion.div
      className={cx(CLASS_NAME, className)}
      id={id}
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true }}
    >
      <motion.div className={cx(`${CLASS_NAME}__inner`)}>
        {/* Чёрный блок-источник */}
        <motion.div
          className={cx(`${CLASS_NAME}__logo-wrapper`)}
          animate={wrapperControls}
          initial={{ opacity: 0 }}
          layout
        >
          <AnimatePresence>
            {/* Логотип */}
            <motion.img
              className={cx(`${CLASS_NAME}__logo`)}
              src={withBase(picture)}
              animate={elementsControls}
              variants={logoVariants}
              custom={0}
              layout
            />
            
            {/* Заголовок */}
            <motion.h2
              className={cx(`${CLASS_NAME}__title`)}
              dangerouslySetInnerHTML={{ __html: title }}
              animate={elementsControls}
              variants={titleVariants}
              custom={1}
              layout
            />
            
            {/* Изображения */}
            {images.map((item, index) => (
              <motion.img
                className={cx(
                  `${CLASS_NAME}__image`,
                  `${CLASS_NAME}__image_${index + 1}`
                )}
                key={index}
                src={withBase(item.src)}
                animate={elementsControls}
                variants={getImageVariants(index)}
                custom={index + 2}
                layout
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Анимации
const logoVariants = {
  offscreen: { opacity: 0, scale: 0.5 },
  flyOut: (custom: number) => ({
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    transition: {
      delay: custom * 0.1,
      type: "spring",
      stiffness: 100
    }
  })
};

const titleVariants = {
  ...logoVariants,
  flyOut: (custom: number) => ({
    ...logoVariants.flyOut(custom),
    transition: {
      delay: custom * 0.1 + 0.2,
      type: "spring",
      stiffness: 80
    }
  })
};

const getImageVariants = (index: number) => ({
  offscreen: { opacity: 0, scale: 0.3 },
  flyOut: (custom: number) => ({
    opacity: 1,
    scale: 1,
    x: Math.cos((index / 5) * Math.PI * 2) * 200,
    y: Math.sin((index / 5) * Math.PI * 2) * 200,
    transition: {
      delay: custom * 0.1,
      type: "spring",
      stiffness: 50,
      damping: 10
    }
  })
});

export default LovelyBank;