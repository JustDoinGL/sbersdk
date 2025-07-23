import { motion, AnimatePresence } from 'framer-motion';
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

const LovelyBank: React.FC<LovelyBankProps> = ({ 
  id = 'LovelyBank', 
  title, 
  picture, 
  images, 
  className 
}) => {
  return (
    <motion.div
      className={cx(CLASS_NAME, className)}
      id={id}
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ amount: 0.75, once: true }}
    >
      <div className={cx(`${CLASS_NAME}_inner`)}>
        {/* Контейнер-источник разлёта */}
        <motion.div
          className={cx(`${CLASS_NAME}_logo-wrapper`)}
          variants={logoWrapperVariants}
          layout
        >
          <AnimatePresence>
            {/* Логотип - остаётся в центре */}
            <motion.img
              className={cx(`${CLASS_NAME}_logo`)}
              src={withBase(picture)}
              variants={logoVariants}
              layout
            />
            
            {/* Заголовок - остаётся в центре */}
            <motion.h2
              className={cx(`${CLASS_NAME}_title`)}
              dangerouslySetInnerHTML={{ __html: title }}
              variants={titleVariants}
              layout
            />
            
            {/* Изображения, которые будут разлетаться */}
            {images.map((item, index) => (
              <motion.div
                key={index}
                layout
                variants={getImageVariants(index, images.length)}
                custom={index}
                className={cx(
                  `${CLASS_NAME}_image-container`,
                  `${CLASS_NAME}_image-container_${index + 1}`
                )}
              >
                <motion.img
                  className={cx(`${CLASS_NAME}_image`)}
                  src={withBase(item.src)}
                  layout
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Анимации
const logoWrapperVariants: Variants = {
  offscreen: {
    scale: 0.7,
    opacity: 0,
    rotate: -10
  },
  onscreen: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: "spring",
      bounce: 0.3,
      duration: 1.2,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const logoVariants: Variants = {
  offscreen: { scale: 0.5, opacity: 0 },
  onscreen: { 
    scale: 1, 
    opacity: 1,
    transition: { type: "spring", bounce: 0.5 }
  }
};

const titleVariants: Variants = {
  offscreen: { y: 20, opacity: 0 },
  onscreen: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", bounce: 0.3 }
  }
};

const getImageVariants = (index: number, total: number): Variants => ({
  offscreen: {
    x: 0,
    y: 0,
    scale: 0.3,
    opacity: 0
  },
  onscreen: {
    x: Math.cos((index / total) * Math.PI * 2) * 200, // Радиальное размещение
    y: Math.sin((index / total) * Math.PI * 2) * 200,
    scale: 1,
    opacity: 1,
    transition: {
      delay: 0.3 + index * 0.05,
      type: "spring",
      stiffness: 50,
      damping: 10
    }
  }
});