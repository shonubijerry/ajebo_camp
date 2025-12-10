import { z } from "zod";

export const DefaultSchema = z.object({
  created_at: z.coerce.date(), // Use z.coerce.date() to handle both Date objects and date strings
  updated_at: z.coerce.date(),
});
