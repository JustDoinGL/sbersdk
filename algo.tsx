
import { vi } from 'vitest';

vi.mock('@sourcegraph/uikit', () => {
  // Создаем заглушки для всех компонентов, которые используются в card.tsx
  return {
    Avatar: () => null,
    IconButton: ({ children }: any) => children, // Или null, если не важен рендер
    // Добавь другие компоненты, если ругается на них
  };
});

// То же самое для других библиотек
vi.mock('@5_shared/ui', () => ({
  // Перечисли все экспорты, которые используются
  Button: () => null,
  Input: () => null,
}));

vi.mock('@5_shared/icons', () => ({
  // Перечисли иконки
  CloseIcon: () => null,
  CheckIcon: () => null,
}));