// Source - https://stackoverflow.com/a/77832557
// Posted by demux, modified by community. See post 'Timeline' for change history
// Retrieved 2026-02-06, License - CC BY-SA 4.0

import type { ZodSchema } from 'zod';

type ZodSchemaFields = { [K: string]: ZodSchemaFields | true };
type DirtyZodSchemaFields = { [K: string]: DirtyZodSchemaFields };

const _proxyHandler = {
  get(fields: DirtyZodSchemaFields, key: string | symbol) {
    if (key === 'then' || typeof key !== 'string') {
      return;
    }
    if (!fields[key]) {
      fields[key] = new Proxy({}, _proxyHandler);
    }
    return fields[key];
  },
};

function _clean(fields: DirtyZodSchemaFields) {
  const cleaned: ZodSchemaFields = {};
  Object.keys(fields).forEach((k) => {
    const val = fields[k];
    cleaned[k] = Object.keys(val).length ? _clean(val) : true;
  });
  return cleaned;
}

export function getZodSchemaFields(schema: ZodSchema): ZodSchemaFields {
  const fields = {};
  schema.safeParse(new Proxy(fields, _proxyHandler));
  return _clean(fields);
}