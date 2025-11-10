// Найти все элементы с вертикальным скроллом
document.querySelectorAll('*').forEach(el => {
    if (el.scrollHeight > el.clientHeight) {
        console.log('Элемент с вертикальным скроллом:', el);
    }
});

// Найти все элементы с горизонтальным скроллом
document.querySelectorAll('*').forEach(el => {
    if (el.scrollWidth > el.clientWidth) {
        console.log('Элемент с горизонтальным скроллом:', el);
    }
});