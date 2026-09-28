import { getSchemaKeys, productsBaseSchema } from "@products/domain/shared/3_shared/validators";
import { dateUtils } from "@/5_shared/date";
import { EMPTY_MESSAGE } from "@/5_shared/const";
import z from "zod";

import { getMaxEndDate, getMaxStartDate } from "./helper";

const MIN_TERM_DAYS = 1;
const MAX_TERM_DAYS = 365;

const MIN_START_DATE_ERROR =
  "Дата начала страхования может быть только с завтрашнего дня.";

const MAX_START_DATE_ERROR =
  "Дата начала страхования превышает максимально допустимую дату.";

const MIN_END_DATE_ERROR =
  "Дата окончания страхования не может быть раньше даты начала.";

const MAX_END_DATE_ERROR =
  "Дата окончания страхования превышает максимально допустимый срок.";

const MIN_TERM_DAYS_ERROR =
  "Срок страхования должен быть не менее 1 дня.";

const MAX_TERM_DAYS_ERROR =
  "Срок страхования не может превышать 1 год.";

const minStartDate = dateUtils.startOfDay(
  dateUtils.tomorrow(),
);

export const policyPeriodsSchema = z
  .object({
    startDate: productsBaseSchema.optionalInputDate(
      z
        .date({ message: EMPTY_MESSAGE })
        .min(minStartDate, {
          message: MIN_START_DATE_ERROR,
        })
        .max(getMaxStartDate(), {
          message: MAX_START_DATE_ERROR,
        }),
    ),

    endDate: productsBaseSchema.optionalInputDate(
      z.date({ message: EMPTY_MESSAGE }),
    ),

    termDays: productsBaseSchema.optionalInputNumber(
      z
        .number({ message: EMPTY_MESSAGE })
        .int({ message: EMPTY_MESSAGE })
        .min(MIN_TERM_DAYS, {
          message: MIN_TERM_DAYS_ERROR,
        })
        .max(MAX_TERM_DAYS, {
          message: MAX_TERM_DAYS_ERROR,
        }),
    ),
  })
  .superRefine((data, ctx) => {
    const { startDate, endDate } = data;

    if (!startDate || !endDate) {
      return;
    }

    const maxEndDate = getMaxEndDate(startDate);

    if (endDate < startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: MIN_END_DATE_ERROR,
      });
    }

    if (endDate > maxEndDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: MAX_END_DATE_ERROR,
      });
    }
  });

export type PolicyPeriodsSchema = z.infer<
  typeof policyPeriodsSchema
>;

export const policyPeriodKeys = getSchemaKeys(
  policyPeriodsSchema,
) as (keyof PolicyPeriodsSchema)[];