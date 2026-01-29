import { z } from "zod";
import { driversSchema } from "./driver_card/schema";

export const driversFormSchema = z.discriminatedUnion("insuranceScope", [
  z.object({
    insuranceScope: z.literal(true),
    drivers: z.array(driversSchema).min(1, "При insuranceScope: true требуется хотя бы один водитель"),
  }),
  z.object({
    insuranceScope: z.literal(false),
    drivers: z.array(driversSchema).optional(), // или .nullable() в зависимости от нужд
  }),
]);