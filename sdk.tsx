
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
          y: '100vh', // Стартуем снизу
          opacity: 0
        }}
        animate={{
          y: isActive ? '50%' : (isPast ? '-100vh' : '100vh'), 
          // Активный - центр, прошлые - верх, будущие - низ
          opacity: isActive ? 1 : 0
        }}
        exit={{
          y: '-100vh', // Уезжает вверх
          opacity: 0,
          transition: { duration: 0.6, ease: 'easeInOut' }
        }}
        transition={{
          y: { 
            type: 'spring', 
            stiffness: 100, 
            damping: 20, 
            mass: 0.8,
            duration: 0.6
          },
          opacity: { duration: 0.4 }
        }}
        dangerouslySetInnerHTML={{ __html: slide.label }}
      />
    );
  })}
</AnimatePresence>