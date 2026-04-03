import { z } from "zod";

import { EMPTY_MESSAGE } from "@5_shared/consts";

const SegmentSchema = z.object({
  value: z.enum(["GRZ", "VIN", "BODY_NUMBER", "CHASSIS_NUMBER"]),
  label: z.string(),
});

const searchSchemaValidate = {
  GRZ: productsBaseSchema.license_plate(),
  VIN: productsBaseSchema.vin(),
  BODY_NUMBER: productsBaseSchema.bodyNumber(),
  CHASSIS_NUMBER: productsBaseSchema.chassisNumber(),
} as const;

export const searchVehicleSegmentControlSchema = z.object({
  searchType: z.discriminatedUnion("type", [
    // Manual режим
    z.object({
      type: z.literal("manual"),
      showFrom: z.boolean(),
      searchParams: SegmentSchema,
      searchIdentifier: z.string().optional(),
      searchValue: z.string(),
    }).superRefine((data, ctx) => {
      const validator = searchSchemaValidate[data.searchParams.value];
      const result = validator.safeParse(data.searchValue);
      
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["searchValue"],
          message: result.error.errors[0]?.message ?? "Некорректное значение",
        });
      }
    }),
    
    // Auto режим с discriminatedUnion от searchParams.value
    z.object({
      type: z.literal("auto"),
      showFrom: z.boolean(),
      searchParams: SegmentSchema,
      searchIdentifier: z.string({ message: EMPTY_MESSAGE }),
      searchValue: z.discriminatedUnion("searchParams.value", [
        // GRZ
        z.object({
          searchParams: z.object({
            value: z.literal("GRZ"),
            label: z.string(),
          }),
          value: searchSchemaValidate.GRZ,
        }),
        // VIN
        z.object({
          searchParams: z.object({
            value: z.literal("VIN"),
            label: z.string(),
          }),
          value: searchSchemaValidate.VIN,
        }),
        // BODY_NUMBER
        z.object({
          searchParams: z.object({
            value: z.literal("BODY_NUMBER"),
            label: z.string(),
          }),
          value: searchSchemaValidate.BODY_NUMBER,
        }),
        // CHASSIS_NUMBER
        z.object({
          searchParams: z.object({
            value: z.literal("CHASSIS_NUMBER"),
            label: z.string(),
          }),
          value: searchSchemaValidate.CHASSIS_NUMBER,
        }),
      ]),
    }),
  ]),
});

export type SearchVehicleSegmentControlSchema = z.infer<typeof searchVehicleSegmentControlSchema>;