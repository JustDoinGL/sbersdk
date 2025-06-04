{
  "extends": "stylelint-config-standard-scss",
  "rules": {
    "block-no-empty": null,  // Отключаем проверку пустых блоков
    
    "scss/dollar-variable-pattern": "^([a-z][a-z0-9]*)(-[a-z0-9]+)*$",  // kebab-case для переменных
    
    "function-url-quotes": "always",  // Обязательные кавычки для url()
    
    // Дополнительные полезные правила
    "selector-class-pattern": null,  // Отключаем проверку имен классов
    "no-descending-specificity": null,  // Отключаем проверку специфичности
    "selector-pseudo-element-no-unknown": [  // Разрешаем кастомные псевдоэлементы
      true,
      {
        "ignorePseudoElements": ["/^--/", "input-placeholder"]
      }
    ]
  }
}