import React, { useState, useRef, useEffect } from 'react';
import './DropdownSearch.css'; // Стили (создайте этот файл)

const DropdownSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const dropdownRef = useRef(null);
  const itemsRef = useRef({});

  // Пример данных
  const items = [
    { id: 1, name: 'JavaScript' },
    { id: 2, name: 'TypeScript' },
    { id: 3, name: 'React' },
    { id: 4, name: 'Vue.js' },
    { id: 5, name: 'Angular' },
    { id: 6, name: 'Node.js' },
    { id: 7, name: 'Python' },
    { id: 8, name: 'Java' },
    { id: 9, name: 'C#' },
    { id: 10, name: 'PHP' },
  ];

  // Фильтрация элементов по поисковому запросу
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Обработчик выбора элемента
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSearchTerm(item.name);
    setIsOpen(false);
    
    // Скролл к выбранному элементу
    scrollToItem(item.id);
  };

  // Функция скролла к элементу
  const scrollToItem = (itemId) => {
    const element = itemsRef.current[itemId];
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // Обработчик изменения поиска
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  // Обработчик клика вне dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown-search" ref={dropdownRef}>
      <div className="dropdown-input">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Поиск технологий..."
          className="search-input"
        />
        <button
          className="dropdown-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          ▼
        </button>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          {filteredItems.length === 0 ? (
            <div className="dropdown-item no-results">
              Ничего не найдено
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                ref={(el) => (itemsRef.current[item.id] = el)}
                className={`dropdown-item ${
                  selectedItem?.id === item.id ? 'selected' : ''
                }`}
                onClick={() => handleSelectItem(item)}
              >
                {item.name}
              </div>
            ))
          )}
        </div>
      )}

      {selectedItem && (
        <div className="selected-info">
          <p>Выбрано: <strong>{selectedItem.name}</strong></p>
          <button
            onClick={() => scrollToItem(selectedItem.id)}
            className="scroll-button"
          >
            Прокрутить к выбранному
          </button>
        </div>
      )}
    </div>
  );
};

export default DropdownSearch;




.dropdown-search {
  position: relative;
  width: 300px;
  margin: 20px;
  font-family: Arial, sans-serif;
}

.dropdown-input {
  display: flex;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
}

.search-input {
  flex: 1;
  padding: 10px;
  border: none;
  outline: none;
  border-radius: 4px 0 0 4px;
}

.dropdown-toggle {
  padding: 10px;
  border: none;
  background: #f5f5f5;
  border-left: 1px solid #ccc;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
}

.dropdown-toggle:hover {
  background: #e0e0e0;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 4px;
}

.dropdown-item {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item.selected {
  background-color: #e3f2fd;
  font-weight: bold;
}

.dropdown-item.no-results {
  color: #999;
  cursor: default;
}

.dropdown-item.no-results:hover {
  background-color: white;
}

.selected-info {
  margin-top: 15px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #f9f9f9;
}

.scroll-button {
  margin-top: 8px;
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.scroll-button:hover {
  background: #0056b3;
}

/* Стили для скроллбара */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

