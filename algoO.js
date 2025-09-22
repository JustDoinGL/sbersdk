type FlatArrayToStringMapper<T extends object> = {
  [K in keyof T]: T[K] extends unknown[] ? string : T[K];
};

function mapFlatArraysToStrings<T extends object>(obj: T): FlatArrayToStringMapper<T> {
  const result: Partial<FlatArrayToStringMapper<T>> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      if (Array.isArray(value)) {
        (result as Record<string, unknown>)[key] = value.join(', ');
      } else {
        (result as Record<string, unknown>)[key] = value;
      }
    }
  }
  
  return result as FlatArrayToStringMapper<T>;
}