import { z } from "zod";

export const ClothingCategorySchema = z.enum([
  "TOPS", "BOTTOMS", "DRESSES", "OUTERWEAR", "SHOES", "ACCESSORIES", "OTHER"
]);

export const ClothingSeasonSchema = z.enum([
  "SPRING", "SUMMER", "FALL", "WINTER", "ALL_SEASON"
]);

export const ClothingOccasionSchema = z.enum([
  "CASUAL", "WORK", "FORMAL", "SPORT", "PARTY", "OTHER"
]);

export const CreateWardrobeItemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: ClothingCategorySchema.default("OTHER"),
  season: ClothingSeasonSchema.default("ALL_SEASON"),
  occasion: ClothingOccasionSchema.default("CASUAL"),
  colors: z.array(z.string()).max(10).default([]),
  brand: z.string().max(100).optional(),
  imageUrl: z.string().url().optional(),
  storageKey: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const UpdateWardrobeItemSchema = CreateWardrobeItemSchema.partial().extend({
  needsLaundry: z.boolean().optional(),
});

export const ListWardrobeItemsSchema = z.object({
  category: ClothingCategorySchema.optional(),
  season: ClothingSeasonSchema.optional(),
  occasion: ClothingOccasionSchema.optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
});

export const MarkWornSchema = z.object({
  id: z.string().cuid(),
});

export type CreateWardrobeItemInput = z.infer<typeof CreateWardrobeItemSchema>;
export type UpdateWardrobeItemInput = z.infer<typeof UpdateWardrobeItemSchema>;
export type ListWardrobeItemsInput = z.infer<typeof ListWardrobeItemsSchema>;
