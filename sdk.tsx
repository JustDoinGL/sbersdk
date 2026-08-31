import { z } from "zod";

type ZodSchema = z.ZodType;

type ZodDef = {
  type: string;
  shape?: Record<string, ZodSchema>;
  element?: ZodSchema;
  innerType?: ZodSchema;
};

const getDef = (schema: ZodSchema): ZodDef =>
  (schema as ZodSchema & {
    _zod: {
      def: ZodDef;
    };
  })._zod.def;

const unwrap = (schema: ZodSchema): ZodSchema => {
  const def = getDef(schema);

  if (
    def.type === "optional" ||
    def.type === "nullable" ||
    def.type === "default" ||
    def.type === "nonoptional" ||
    def.type === "readonly"
  ) {
    return unwrap(def.innerType!);
  }

  return schema;
};

const findAllKeys = (
  schema: ZodSchema,
  prefix = "",
  indexes = 1,
): string[] => {
  const current = unwrap(schema);
  const def = getDef(current);

  if (def.type === "object" && def.shape) {
    return Object.entries(def.shape).flatMap(([key, child]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      return [
        fullKey,
        ...findAllKeys(child, fullKey, indexes),
      ];
    });
  }

  if (def.type === "array" && def.element) {
    return Array.from({ length: indexes }, (_, index) =>
      findAllKeys(
        def.element!,
        `${prefix}.${index}`,
        indexes,
      ),
    ).flat();
  }

  return [];
};

export const getSchemaKeys = (
  schema: z.ZodType,
  indexes = 1,
  includesKeys?: string[],
): string[] => {
  const keys = findAllKeys(schema, "", indexes);

  if (!includesKeys?.length) {
    return keys;
  }

  return keys.filter(key =>
    includesKeys.some(searchKey => key.includes(searchKey)),
  );
};