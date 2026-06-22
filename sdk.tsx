<AnimatePresence mode="wait">
  {data.assistant.items.map((slide, slideIndex) => {
    const isActive = slideIndex === activeIndex;
    const isPast = slideIndex < activeIndex;
    const isFuture = slideIndex > activeIndex;

    if (slideIndex > activeIndex) return null;
    console.log(isActive, isPast, isFuture);

    return (
      <motion.div
        key={`label-${slideIndex}-${slideIndex}`}
        className={cx('${CLASS_NAME}_label', '${CLASS_NAME}_label_slide_${slideIndex}')}
        initial={{
          y: '100vh', // Изначально снизу
          opacity: 0
        }}
        animate={{
          y: isActive ? '50%' : '0%', // Активный - по центру, прошлые - сверху
          opacity: isActive ? 1 : 0.5 // Активный ярче, прошлые тусклее
        }}
        exit={{
          y: '-100vh', // Уезжает вверх (при скролле вниз)
          opacity: 0,
          transition: { duration: 0.5, ease: 'easeInOut' }
        }}
        transition={{
          y: { 
            type: 'spring', 
            stiffness: 100, 
            damping: 20, 
            mass: 0.8 
          },
          opacity: { duration: 0.5 }
        }}
        dangerouslySetInnerHTML={{ __html: slide.label }}
      />
    );
  })}
</AnimatePresence>