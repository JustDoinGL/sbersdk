import { defineConfig } from "orval";

export default defineConfig({
  main: {
    input: "../api.yml",
    output: {
      target: "./src/shared/api/generated",
      schemas: "./src/shared/api/generated/model",
      prettier: true,
      client: "react-query",
      mode: "tags",
      override: {
        query: {
          useSuspenseQuery: true,
        },
        mutator: {
          path: "./src/shared/api/instance.ts",
          name: "apiInstance",
        },
      },
    },
  },
});

import { defineConfig } from 'orval';

export default defineConfig({
  // Название вашего API
  myApi: {
    // Источник спецификации
    input: {
      target: './path/to/your/openapi-spec.yaml',
      override: {
        // Функция для трансформации схемы
        transformer: (api) => {
          // Обходим все схемы в компонентах
          if (api.components?.schemas) {
            for (const schemaName of Object.keys(api.components.schemas)) {
              const schema = api.components.schemas[schemaName];
              // Устанавливаем кастомный атрибут для схемы
              // Позже он будет использован для генерации 'type' вместо 'interface'
              (schema as any)['x-typescript'] = 'type';
            }
          }
          // Возвращаем изменённую спецификацию
          return api;
        },
      },
    },
    // Настройка вывода
    output: {
      // Папка для сгенерированных типов
      schemas: './src/api/models',
      // Генерация только типов (без функций клиента)
      mode: 'split',
      // Клиент не указан - генерируются только типы
    },
  },
});
