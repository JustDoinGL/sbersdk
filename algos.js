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
          headersObj['x-correlation-id'];
        
        // Получаем тело ответа
        const data = xhr.responseText;
        
        resolve({
          data: tryParseJson(data),
          headers: headersObj,
          requestId,
          status: xhr.status
        });
      } catch (error) {
        reject(error);
      }
    };
    
    xhr.onerror = reject;
    xhr.send();
  });
}

// Использование
getHeadersWithXHR('https://api.example.com/data')
  .then(result => {
    console.log('✅ Request ID найден:', result.requestId);
    console.log('📋 Все заголовки:', result.headers);
  })
  .catch(error => {
    console.error('Ошибка:', error);
  });