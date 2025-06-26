// Получить все cookies
const cookies = document.cookie;

// Проверить наличие cookie, начинающейся с "ban"
const hasBanCookie = cookies.split(';').some(cookie => {
  const [name] = cookie.trim().split('=');
  return name.startsWith('ban');
});

console.log('Есть cookie с префиксом "ban":', hasBanCookie);