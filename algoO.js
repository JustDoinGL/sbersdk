function mapFlatArraysToStrings<T extends object>(obj: T): FlatArrayToStringMapper<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: Array.isArray(value) ? value.join(', ') : value
    };
  }, {} as Record<string, unknown>) as FlatArrayToStringMapper<T>;
}