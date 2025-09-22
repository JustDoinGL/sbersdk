type TransformArrays<T> = T extends Array<infer U>
  ? string
  : T extends object
    ? { [K in keyof T]: TransformArrays<T[K]> }
    : T;

function mapArraysToStringsReduce<T extends Record<string, unknown>>(
  obj: T
): TransformArrays<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (Array.isArray(value)) {
      return { ...acc, [key]: value.join(', ') };
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      return { ...acc, [key]: mapArraysToStringsReduce(value as Record<string, unknown>) };
    } else {
      return { ...acc, [key]: value };
    }
  }, {} as Record<string, unknown>) as TransformArrays<T>;
}