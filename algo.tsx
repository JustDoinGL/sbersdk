// Наблюдаем за появлением конкретного элемента
function waitForElement(selector, callback) {
  const observer = new MutationObserver((mutations) => {
    const element = document.querySelector(selector);
    if (element) {
      observer.disconnect();
      callback(element);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Использование
waitForElement('#my-button', (element) => {
  console.log('Элемент появился в DOM:', element);
});