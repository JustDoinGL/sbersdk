const createDeadline = (daysToAdd: number = 0): number => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysToAdd);
  
  return new Date(date.toISOString().split('T')[0] + 'T00:00:00.000Z').getTime();
};

// Использование:
const today = createDeadline(); // сегодня 00:00 UTC
const tomorrow = createDeadline(1); // завтра 00:00 UTC
const in3Days = createDeadline(3); // через 3 дня 00:00 UTC