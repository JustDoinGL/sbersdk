import { motion, AnimatePresence } from 'framer-motion';

const LovelyBank = ({ id = 'LovelyBank', title, picture, images, className }: LovelyBankProps) => {
  return (
    <motion.div
      className={cx(CLASS_NAME, className)}
      id={id}
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ amount: 0.75, once: true }}
      layout // Включаем layout-анимацию для корневого элемента
    >
      <motion.div 
        className={cx(`${CLASS_NAME}_inner`)}
        layout
      >
        {/* Контейнер-источник разлёта */}
        <motion.div
          className={cx(`${CLASS_NAME}_logo-wrapper`)}
          variants={logoWrapperVariants}
          layoutId="source-layout" // Уникальный ID для связи анимаций
        >
          <AnimatePresence>
            {/* Логотип */}
            <motion.img
              layoutId="logo"
              className={cx(`${CLASS_NAME}_logo`)}
              src={withBase(picture)}
              variants={logoVariants}
            />

            {/* Заголовок */}
            <motion.h2
              layoutId="title"
              className={cx(`${CLASS_NAME}_title`)}
              dangerouslySetInnerHTML={{ __html: title }}
              variants={titleVariants}
            />

            {/* Изображения */}
            {images.map((item, index) => (
              <motion.img
                layoutId={`image-${index}`}
                className={cx(
                  `${CLASS_NAME}_image`,
                  `${CLASS_NAME}_image_${index + 1}`
                )}
                key={index}
                src={withBase(item.src)}
                variants={getImageVariants(index, images.length)}
                custom={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};


const logoWrapperVariants: Variants = {
  offscreen: {
    scale: 0.8,
    opacity: 0,
    rotate: -5
  },
  onscreen: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 1.5,
      when: "beforeChildren" // Сначала анимируется контейнер
    }
  }
};

const getImageVariants = (index: number): Variants => ({
  offscreen: {
    x: `${(index % 3 - 1) * 100}%`, // -100%, 0%, +100% по горизонтали
    y: `${Math.floor(index / 3) * -80}px`, // Разлет по вертикали
    opacity: 0,
    transition: {
      type: "spring",
      bounce: 0.5
    }
  },
  onscreen: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      delay: index * 0.15,
      type: "spring",
      bounce: 0.3
    }
  }
});