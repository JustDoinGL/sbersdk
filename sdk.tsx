const formatName = (value: string) => {
  return value
    .split(/(\s|-)/) // Разбиваем по пробелам И дефисам
    .map(part => 
      part === " " || part === "-" 
        ? part 
        : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    .join("");
};