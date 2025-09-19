function getOneYearAgo() {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Форматируем дату
    const year = oneYearAgo.getFullYear();
    const month = String(oneYearAgo.getMonth() + 1).padStart(2, '0');
    const day = String(oneYearAgo.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

console.log(getOneYearAgo()); // "2024-07-11"