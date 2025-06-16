button {
    transition: background-color 0.2s;
    -webkit-tap-highlight-color: transparent; /* Убирает подсветку на iOS */
    touch-action: manipulation; /* Улучшает отклик касаний */
}

/* Десктопы (мышка) */
@media (hover: hover) {
    button:hover { background-color: #hover-color; }
    button:active { background-color: #active-color; }
}

/* Мобилки (тач) */
@media (hover: none) {
    button:active {
        background-color: #active-color;
    }
}