const getImageStyles = (index: number) => {
  const styles = {
    1: {
      top: "-10px",
      right: "214px",
      zIndex: 5,
    },
    2: {
      top: "231px",
      right: "0",
      zIndex: 4,
    },
    3: {
      bottom: "-96px",
      right: "127px",
      zIndex: 4,
    },
    4: {
      bottom: "-41px",
      left: "164px",
      zIndex: 4,
    },
    5: {
      top: "144px",
      left: "0",
      zIndex: 4,
    },
  };

  return styles[index] || {}; // Возвращает пустой объект, если индекс невалидный
};

// Пример использования:
const image1Styles = getImageStyles(1); // { top: "-10px", right: "214px", zIndex: 5 }
const image3Styles = getImage