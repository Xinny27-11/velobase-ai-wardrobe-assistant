import { z } from "zod";

export const CreatePackingListSchema = z.object({
  name: z.string().min(1).max(200),
  destination: z.string().min(1).max(200),
  durationDays: z.number().min(1).max(365),
  activities: z.array(z.string().max(100)).max(20).default([]),
  startDate: z.string().datetime().optional(),
  weatherDescription: z.string().max(300).optional(),
});

export const AddPackingItemSchema = z.object({
  packingListId: z.string().cuid(),
  itemId: z.string().cuid().optional(),
  customName: z.string().max(200).optional(),
}).refine(
  (d) => d.itemId || d.customName,
  { message: "Either itemId or customName is required" }
);

export const TogglePackedSchema = z.object({
  packingListItemId: z.string().cuid(),
});

export type CreatePackingListInput = z.infer<typeof CreatePackingListSchema>;
