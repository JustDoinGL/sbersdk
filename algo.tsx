import { describe, expect, it, vi } from "vitest";

// ВАЖНО: мокаем именно @sg/uikit, а не @sourcegraph/uikit
vi.mock("@sg/uikit", () => ({
  Avatar: () => null,
  IconButton: ({ children }: any) => children,
}));

vi.mock("@5_shared/ui", () => {
  return new Proxy({}, {
    get: (_, prop) => {
      if (prop === "__esModule") return true;
      return () => null;
    },
  });
});

vi.mock("@5_shared/icons", () => {
  return new Proxy({}, {
    get: (_, prop) => {
      if (prop === "__esModule") return true;
      return () => null;
    },
  });
});

// ... далее твои импорты и тесты