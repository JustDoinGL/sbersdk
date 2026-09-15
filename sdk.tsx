export type DictionaryWithDescription = Dictionary & {
  description: string;
};

export type ProductResponseMap = {
  accidents: {
    professions: DictionaryWithDescription[];
    sports: Dictionary[];
  };
};

export type PRODUCT = keyof ProductResponseMap;

export type ProductCodeMap = {
  [T in PRODUCT]: keyof ProductResponseMap[T];
};

export type SearchDictionariesParams<T extends PRODUCT> = {
  code: ProductCodeMap[T];
  query?: string;
  page?: number;
  page_size?: number;
};

export type SearchDictionaryResponse<
  T extends PRODUCT,
  K extends ProductCodeMap[T],
> = {
  count: number;
  data: ProductResponseMap[T][K];
};