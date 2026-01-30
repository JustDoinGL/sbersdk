// Полная рабочая функция для консоли браузера
function getHeadersWithXHR(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        // ВАЖНО: Сначала установите обработчик
        xhr.onload = function() {
            try {
                // Получаем ВСЕ заголовки ответа как строку
                const allHeaders = xhr.getAllResponseHeaders();

                // Преобразуем в объект
                const headersObj = {};
                const headersArray = allHeaders.trim().split('\n');

                headersArray.forEach(line => {
                    const [key, ...valueParts] = line.split(':');
                    if (key && valueParts.length) {
                        headersObj[key.trim()] = valueParts.join(':').trim();
                    }
                });

                // Ищем requestId в любом регистре
                const requestId =
                    headersObj['X-Request-ID'] ||
                    headersObj['x-request-id'] ||
                    headersObj['Request-ID'] ||
                    headersObj['request-id'] ||
                    headersObj['X-Correlation-ID'] ||
                    headersObj['x-correlation-id'] ||
                    headersObj['correlation-id'];

                // Получаем тело ответа
                const data = xhr.responseText;

                // Пытаемся распарсить JSON, если не выходит - оставляем как есть
                let parsedData;
                try {
                    parsedData = JSON.parse(data);
                } catch {
                    parsedData = data;
                }

                resolve({
                    data: parsedData,
                    headers: headersObj,
                    requestId,
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            } catch (error) {
                reject(error);
            }
        };

        xhr.onerror = function() {
            reject(new Error('Network error'));
        };

        xhr.ontimeout = function() {
            reject(new Error('Request timeout'));
        };

        xhr.send();
    });
}

// Функция для удобного вывода в консоль
async function debugHeaders(url) {
    console.log('🔍 Запрашиваю URL:', url);
    
    try {
        const result = await getHeadersWithXHR(url);
        
        console.log('✅ Статус:', result.status, result.statusText);
        
        if (result.requestId) {
            console.log('🎯 Request ID найден:', result.requestId);
        } else {
            console.log('❌ Request ID не найден в заголовках');
        }
        
        console.log('📋 Все заголовки:');
        console.table(result.headers);
        
        console.log('📦 Тело ответа:');
        if (typeof result.data === 'object') {
            console.dir(result.data);
        } else {
            console.log(result.data);
        }
        
        return result;
    } catch (error) {
        console.error('💥 Ошибка:', error.message);
        throw error;
    }
}

// =========== ИСПОЛЬЗОВАНИЕ ===========
// Просто скопируйте и выполните в консоли DevTools:

// 1. Проверить текущую страницу
// debugHeaders(window.location.href);

// 2. Проверить конкретный API эндпоинт
// debugHeaders('https://jsonplaceholder.typicode.com/todos/1');

// 3. Проверить ваш API (замените на реальный URL)
// debugHeaders('https://ваш-бекенд.ru/api/endpoint');

// 4. Интерактивный вариант
function testYourApi() {
    const url = prompt('Введите URL для проверки заголовков:', window.location.href);
    if (url) {
        debugHeaders(url);
    }
}

// 5. Вывести все в виде удобной таблицы
function showHeadersTable(url) {
    getHeadersWithXHR(url)
        .then(result => {
            console.group('📊 Результат запроса');
            console.log('URL:', url);
            console.log('Status:', result.status);
            console.log('Request ID:', result.requestId || 'Не найден');
            
            console.log('\n📋 Заголовки ответа:');
            for (const [key, value] of Object.entries(result.headers)) {
                console.log(`  ${key}: ${value}`);
            }
            
            console.log('\n📦 Тело ответа (первые 500 символов):');
            const preview = typeof result.data === 'string' 
                ? result.data.substring(0, 500)
                : JSON.stringify(result.data, null, 2).substring(0, 500);
            console.log(preview);
            
            console.groupEnd();
        })
        .catch(console.error);
}



// 1. Проверить заголовки текущей страницы
getHeadersWithXHR(window.location.href)
    .then(result => {
        console.log('Request ID:', result.requestId);
        console.log('Все заголовки:', result.headers);
    });

// 2. Или проще - используйте debugHeaders
debugHeaders('https://jsonplaceholder.typicode.com/todos/1');

// 3. Для вашего API (замените URL)
const apiUrl = 'https://ваш-домен.ru/api/ваш-эндпоинт';
debugHeaders(apiUrl);




// Вставьте прямо в консоль и замените URL
const url = 'ВАШ_URL_ЗДЕСЬ';
const xhr = new XMLHttpRequest();
xhr.open('GET', url);
xhr.onload = function() {
    console.log('=== ЗАГОЛОВКИ ===');
    console.log(xhr.getAllResponseHeaders());
    
    console.log('\n=== ТЕЛО ОТВЕТА ===');
    console.log(xhr.responseText);
    
    console.log('\n=== Request ID ===');
    const headers = xhr.getAllResponseHeaders();
    const lines = headers.split('\n');
    for (const line of lines) {
        if (line.toLowerCase().includes('request-id') || 
            line.toLowerCase().includes('correlation')) {
            console.log('НАЙДЕНО:', line);
        }
    }
};
xhr.send();





