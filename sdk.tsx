import { useScrollDirection } from './hooks/useScrollDirection';

const YourComponent = () => {
  const scrollDirection = useScrollDirection();
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Логика изменения activeIndex при скролле
  useEffect(() => {
    const handleScroll = () => {
      // Ваша логика определения активного индекса
      // Например, по позиции скролла
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {data.assistant.items
        .filter((_, index) => index <= activeIndex)
        .map((slide, slideIndex) => {
          const isActive = slideIndex === activeIndex;
          const isPast = slideIndex < activeIndex;
          
          // Определяем направление движения в зависимости от скролла
          const getYPosition = () => {
            if (isActive) return '50%';
            
            if (isPast) {
              // Прошлые элементы уезжают в зависимости от направления
              return scrollDirection === 'down' ? '-100vh' : '100vh';
            }
            
            return '100vh';
          };

          return (
            <motion.div
              key={`label-${slideIndex}`}
              className={cx(
                `${CLASS_NAME}_label`,
                `${CLASS_NAME}_label_slide_${slideIndex}`
              )}
              initial={{
                y: scrollDirection === 'down' ? '100vh' : '-100vh', // Выезжает снизу или сверху
                opacity: 0
              }}
              animate={{
                y: getYPosition(),
                opacity: isActive ? 1 : 0
              }}
              exit={{
                y: scrollDirection === 'down' ? '-100vh' : '100vh', // Уезжает вверх или вниз
                opacity: 0,
                transition: { duration: 0.6, ease: 'easeInOut' }
              }}
              transition={{
                y: { 
                  type: 'spring', 
                  stiffness: 100, 
                  damping: 20,
                  mass: 0.8
                },
                opacity: { duration: 0.4 }
              }}
              dangerouslySetInnerHTML={{ __html: slide.label }}
            />
          );
        })}
    </AnimatePresence>
  );
};