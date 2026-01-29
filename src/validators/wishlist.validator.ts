import { z } from "zod";

export const AddToWishlistSchema = z.object({
  dealId: z.number().int().positive(),
  alertEnabled: z.boolean().optional(),
});
