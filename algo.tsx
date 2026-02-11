// Тип для функций маски
export type MaskFunctions = {
  mask: (v: string) => string;
  unmask: (v: string) => string;
  clean?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

// Фабрика масок в виде объекта ключ-значение
export const masks = {
  autoStateNumber: {
    mask: (v: string): string => {
      const value = v.replace(/\s/g, "").toUpperCase();
      const parts = [];

      if (value.length > 0) {
        parts.push(value[0]);
      }

      if (value.length > 1) {
        parts.push(value.slice(1, Math.min(4, value.length)));
      }

      if (value.length > 4) {
        parts.push(value.slice(4, Math.min(6, value.length)));
      }

      if (value.length > 6) {
        parts.push(value.slice(6, 9));
      }

      return parts.join("");
    },
    unmask: (v: string): string => v.replace(/\s/g, ""),
    clean: (e: React.ChangeEvent<HTMLInputElement>): void => {
      e.target.value = e.target.value.replace(/\s/g, "");
    }
  },

  phoneNumber: {
    mask: (v: string): string => {
      const cleaned = v.replace(/\D/g, '');
      const match = cleaned.match(/^(\d{1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
      
      if (!match) return v;
      
      return [
        '+7',
        match[2] ? `(${match[2]}` : '',
        match[3] ? `)${match[3]}` : '',
        match[4] ? `-${match[4]}` : '',
        match[5] ? `-${match[5]}` : ''
      ].join('');
    },
    unmask: (v: string): string => v.replace(/\D/g, '')
  },

  creditCard: {
    mask: (v: string): string => {
      const cleaned = v.replace(/\D/g, '');
      const parts = [];
      
      for (let i = 0; i < cleaned.length; i += 4) {
        parts.push(cleaned.slice(i, i + 4));
      }
      
      return parts.join(' ');
    },
    unmask: (v: string): string => v.replace(/\s/g, '')
  },

  passport: {
    mask: (v: string): string => {
      const cleaned = v.replace(/\s/g, '').toUpperCase();
      if (cleaned.length <= 4) return cleaned;
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 10)}`;
    },
    unmask: (v: string): string => v.replace(/\s/g, '')
  },

  date: {
    mask: (v: string): string => {
      const cleaned = v.replace(/\D/g, '');
      if (cleaned.length <= 2) return cleaned;
      if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 4)}.${cleaned.slice(4, 8)}`;
    },
    unmask: (v: string): string => v.replace(/\D/g, '')
  }
} as const;

// Тип для ключей масок
export type MaskKey = keyof typeof masks;

// Функция для получения маски по ключу
export const getMask = <T extends MaskKey>(key: T): typeof masks[T] => {
  return masks[key];
};

// Пример использования:
// const autoMask = getMask('autoStateNumber');
// const formatted = autoMask.mask('A123BC777');
// const cleaned = autoMask.unmask('A123 BC 777');