const createDeadline = (daysToAdd = 0) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + 1 + daysToAdd);
    
    // Устанавливаем время в 00:00:00 UTC
    date.setUTCHours(0, 0, 0, 0);
    
    return date.getTime();
};

console.log(createDeadline());