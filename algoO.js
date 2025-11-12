import React, { useRef, useEffect } from 'react';

export const ModalFilters: React.FC<ModalFiltersProps> = (props) => {
  const modalRef = useRef(null);
  const { isOpen, onClose, onApply, children, onReset } = props;

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Ищем кнопку по типу или другим атрибутам
      const button = modalRef.current.querySelector('button[type="submit"]') || 
                    modalRef.current.querySelector('button') ||
                    modalRef.current.querySelector('[data-button-type="apply"]');
      
      if (button) {
        // Удаляем кнопку
        button.remove();
        // Или скрываем
        // button.style.display = 'none';
        // button.style.visibility = 'hidden';
        // button.hidden = true;
      }
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hasIconClose={false}
      height="full-height"
      ref={modalRef}
    >
      <form className={styles.container} onSubmit={onApply}>
        <div className={styles.header}>
          {children}
        </div>
      </form>
    </Modal>
  );
};