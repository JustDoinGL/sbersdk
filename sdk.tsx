import { z } from "zod";

const SegmentsSchema = z.object({
  value: z.enum(["GRZ", "VIN", "BODY_NUMBER", "CHASSIS_NUMBER"]),
  label: z.string(),
});

const EMPTY_MESSAGE = "Поле обязательно для заполнения";

const searchSchemaValidate = {
  GRZ: productsBaseSchema.license_plate(),
  VIN: productsBaseSchema.vin(),
  BODY_NUMBER: productsBaseSchema.bodyNumber(),
  CHASSIS_NUMBER: productsBaseSchema.chassisNumber(),
} as const;

// Единая схема с discriminatedUnion от searchParams.value
export const searchFormSchema = z.discriminatedUnion("searchParams.value", [
  // GRZ
  z.object({
    searchParams: z.object({
      value: z.literal("GRZ"),
      label: z.string(),
    }),
    searchType: z.discriminatedUnion("type", [
      z.object({
        type: z.literal("manual"),
        showFrom: z.boolean(),
        searchIdentifier: z.string().optional(),
        searchValue: searchSchemaValidate.GRZ,
      }),
      z.object({
        type: z.literal("auto"),
        showFrom: z.boolean(),
        searchIdentifier: z.string({ message: EMPTY_MESSAGE }),
        searchValue: searchSchemaValidate.GRZ,
      }),
    ]),
  }),
  
  // VIN
  z.object({
    searchParams: z.object({
      value: z.literal("VIN"),
      label: z.string(),
    }),
    searchType: z.discriminatedUnion("type", [
      z.object({
        type: z.literal("manual"),
        showFrom: z.boolean(),
        searchIdentifier: z.string().optional(),
        searchValue: searchSchemaValidate.VIN,
      }),
      z.object({
        type: z.literal("auto"),
        showFrom: z.boolean(),
        searchIdentifier: z.string({ message: EMPTY_MESSAGE }),
        searchValue: searchSchemaValidate.VIN,
      }),
    ]),
  }),
  
  // BODY_NUMBER
  z.object({
    searchParams: z.object({
      value: z.literal("BODY_NUMBER"),
      label: z.string(),
    }),
    searchType: z.discriminatedUnion("type", [
      z.object({
        type: z.literal("manual"),
        showFrom: z.boolean(),
        searchIdentifier: z.string().optional(),
        searchValue: searchSchemaValidate.BODY_NUMBER,
      }),
      z.object({
        type: z.literal("auto"),
        showFrom: z.boolean(),
        searchIdentifier: z.string({ message: EMPTY_MESSAGE }),
        searchValue: searchSchemaValidate.BODY_NUMBER,
      }),
    ]),
  }),
  
  // CHASSIS_NUMBER
  z.object({
    searchParams: z.object({
      value: z.literal("CHASSIS_NUMBER"),
      label: z.string(),
    }),
    searchType: z.discriminatedUnion("type", [
      z.object({
        type: z.literal("manual"),
        showFrom: z.boolean(),
        searchIdentifier: z.string().optional(),
        searchValue: searchSchemaValidate.CHASSIS_NUMBER,
      }),
      z.object({
        type: z.literal("auto"),
        showFrom: z.boolean(),
        searchIdentifier: z.string({ message: EMPTY_MESSAGE }),
        searchValue: searchSchemaValidate.CHASSIS_NUMBER,
      }),
    ]),
  }),
]);

export type SearchFormSchema = z.infer<typeof searchFormSchema>;