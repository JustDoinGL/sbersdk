/* FloatingIconMenu.css */
.floating-menu-wrapper {
  display: none;
}

/* Показываем только на мобильных устройствах */
@media (max-width: 768px) {
  .floating-menu-wrapper {
    display: block;
  }
  
  /* Фоновое затемнение */
  .menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: transparent;
    z-index: 998;
  }
  
  /* Основной контейнер меню */
  .floating-menu-container {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 999;
    background: transparent;
  }
  
  /* Контейнер с элементами меню - flex, снизу вверх */
  .menu-items-list {
    position: absolute;
    right: 0;
    bottom: 60px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
    margin-bottom: 10px;
    animation: slideUp 0.3s ease;
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Элементы меню */
  .menu-item {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    padding: 12px 16px;
    background: white;
    border: none;
    border-radius: 25px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    animation: itemAppear 0.3s ease forwards;
    opacity: 0;
    transition: all 0.2s ease;
    min-width: 150px;
    max-width: 200px;
  }
  
  @keyframes itemAppear {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .menu-item:hover {
    background: #f5f5f5;
    transform: translateX(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
  
  .menu-item:active {
    transform: scale(0.98);
  }
  
  /* Иконка элемента */
  .item-icon {
    font-size: 20px;
    flex-shrink: 0;
  }
  
  /* Текст элемента */
  .item-label {
    font-size: 14px;
    color: #333;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
  }
  
  /* Основная кнопка меню */
  .main-menu-button {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: none;
    background: #4a76a8;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 24px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    position: relative;
    z-index: 10;
    margin-left: auto;
  }
  
  .main-menu-button:hover {
    background: #3a6390;
    transform: scale(1.1);
  }
  
  .main-menu-button:active {
    transform: scale(0.95);
  }
  
  .main-button-icon {
    display: block;
    transition: transform 0.3s ease;
  }
  
  .floating-menu-container.open .main-button-icon {
    transform: rotate(180deg);
  }
  
  /* Анимация закрытия */
  .floating-menu-container:not(.open) .menu-item {
    animation: itemDisappear 0.25s ease forwards;
  }
  
  @keyframes itemDisappear {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(20px);
    }
  }
}

/* Для планшетов */
@media (max-width: 768px) and (min-width: 481px) {
  .menu-item {
    padding: 10px 14px;
    min-width: 140px;
    max-width: 180px;
  }
  
  .item-icon {
    font-size: 18px;
  }
  
  .item-label {
    font-size: 13px;
  }
  
  .main-menu-button {
    width: 52px;
    height: 52px;
    font-size: 22px;
  }
}

/* Для маленьких телефонов */
@media (max-width: 480px) {
  .floating-menu-container {
    right: 15px;
    bottom: 15px;
  }
  
  .menu-items-list {
    bottom: 55px;
    gap: 8px;
  }
  
  .menu-item {
    padding: 10px 12px;
    min-width: 130px;
    max-width: 160px;
    gap: 10px;
  }
  
  .item-icon {
    font-size: 16px;
  }
  
  .item-label {
    font-size: 12px;
  }
  
  .main-menu-button {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}





// FloatingIconMenu.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import "./a.css";

interface MenuItem {
  id: number;
  label: string;
  icon: string;
  onClick?: () => void;
}

interface FloatingIconMenuProps {
  items?: MenuItem[];
  onOpenChange?: (isOpen: boolean) => void;
}

const defaultItems: MenuItem[] = [
  { id: 1, label: "Клиенты", icon: "👥" },
  { id: 2, label: "Точки продаж", icon: "📍" },
  { id: 3, label: "Аналитика", icon: "📊" },
  { id: 4, label: "Главная", icon: "🏠" },
  { id: 5, label: "Сделки", icon: "🤝" },
  { id: 6, label: "Активности", icon: "📈" },
  { id: 7, label: "Ещё", icon: "⋯" },
];

const FloatingIconMenu: React.FC<FloatingIconMenuProps> = ({
  items = defaultItems,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsOpen((prev) => {
        const newState = !prev;
        onOpenChange?.(newState);
        return newState;
      });
    },
    [onOpenChange]
  );

  const closeMenu = useCallback(() => {
    if (!isOpen) return;
    setIsOpen(false);
    onOpenChange?.(false);
  }, [isOpen, onOpenChange]);

  const handleItemClick = useCallback(
    (item: MenuItem, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (item.onClick) {
        item.onClick();
      }

      closeMenu();
    },
    [closeMenu]
  );

  // Обработка клика вне элемента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;

      const target = event.target as Node;
      const menuElement = menuRef.current;
      const buttonElement = buttonRef.current;

      if (
        menuElement &&
        buttonElement &&
        !menuElement.contains(target) &&
        !buttonElement.contains(target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeMenu]);

  return (
    <div className="floating-menu-wrapper">
      {/* Фоновое затемнение */}
      {isOpen && <div className="menu-overlay" onClick={closeMenu} />}

      {/* Основной контейнер меню */}
      <div
        ref={menuRef}
        className={`floating-menu-container ${isOpen ? "open" : ""}`}
        style={{
          position: "fixed",
          right: "20px",
          bottom: "20px",
          zIndex: 1000,
        }}
      >
        {/* Контейнер с элементами меню */}
        {isOpen && (
          <div className="menu-items-list">
            {items.map((item, index) => (
              <button
                key={item.id}
                className="menu-item"
                onClick={(e) => handleItemClick(item, e)}
                aria-label={item.label}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <span className="item-icon">{item.icon}</span>
                <span className="item-label">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Основная кнопка меню */}
        <button
          ref={buttonRef}
          className="main-menu-button"
          onClick={toggleMenu}
          aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={isOpen}
        >
          <span className="main-button-icon">
            {isOpen ? "✕" : "☰"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default FloatingIconMenu;


