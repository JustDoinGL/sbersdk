{
  "extends": "stylelint-config-standard-scss",
  "rules": {
    // Отключаем/настраиваем правила для глобальных функций
    "scss/no-global-function-names": null,
    
    // Обязательные кавычки для URL
    "function-url-quotes": "always",
    
    // Паттерн для переменных (kebab-case)
    "scss/dollar-variable-pattern": "^[a-z][a-z0-9-]*$",
    
    // Паттерн для имен keyframes (kebab-case)
    "keyframes-name-pattern": "^[a-z][a-z0-9-]*$",
    
    // Разрешаем переопределение shorthand свойств
    "declaration-block-no-shorthand-property-overrides": null,
    
    // Дополнительные настройки для удобства
    "block-no-empty": null,
    "selector-class-pattern": null,
    "no-descending-specificity": null
  }
}