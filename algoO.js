function mapFlatArraysToStrings<T extends object>(obj: T): FlatArrayToStringMapper<T> {
  const result = {} as Record<string, unknown>;
  
  (Object.keys(obj) as Array<keyof T>).forEach(key => {
    const value = obj[key];
    result[key as string] = Array.isArray(value) ? value.join(', ') : value;
  });
  
  return result as FlatArrayToStringMapper<T>;
}