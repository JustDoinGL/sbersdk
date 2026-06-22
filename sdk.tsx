<AnimatePresence mode="wait">
  {data.assistant.items
    .filter((_, index) => index <= activeIndex)
    .map((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      
      return (
        <motion.div
          key={`label-${slideIndex}-${isActive ? 'active' : 'past'}`} // ← Уникальный key
          className={cx(
            `${CLASS_NAME}_label`,
            `${CLASS_NAME}_label_slide_${slideIndex}`
          )}
          initial={{
            y: '100vh',
            opacity: 0
          }}
          animate={{
            y: isActive ? '50%' : '-100vh',
            opacity: isActive ? 1 : 0
          }}
          exit={{
            y: '-100vh',
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