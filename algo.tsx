import { z } from 'zod';

const rusAutoNumberSchema = z.string().regex(
  /^[АВЕКМНОРСТУХ]{1}\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}$/,
  'Некорректный формат номера'
);