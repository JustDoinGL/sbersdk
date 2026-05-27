import dayjs from 'dayjs';

const ttDate = "2026-05-21T20:59:59Z";
const currentDate = dayjs(); // текущая дата/время

// Сравнение: если текущая дата меньше или равна ttDate → не истекла
if (currentDate.isBefore(ttDate) || currentDate.isSame(ttDate)) {
    console.log('✅ Окей — дата не истекла');
} else {
    console.log('❌ Не окей — дата истекла');
}

// Или короче — проверка, истекла ли уже:
const isExpired = dayjs().isAfter(ttDate);
console.log(isExpired ? 'Истекла' : 'Не истекла');