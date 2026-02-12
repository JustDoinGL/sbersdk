fullname: {
  mask: (v: string): string => {
    return v
      .replace(/\s+/g, ' ')         // убираем лишние пробелы
      .trim()                       // обрезаем по краям
      .split(' ')                  // разбиваем на слова
      .map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(' ');                  // собираем обратно
  }
}