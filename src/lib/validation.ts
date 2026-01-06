import { z } from "zod";

export const currencySchema = z.enum(["INR", "USD"]);

export const dateSchema = z.coerce.date();

export const idSchema = z.number().int().positive();

export const optionalIdSchema = z.number().int().positive().nullable();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});
