import { z } from "zod";
import { ClothingOccasionSchema, ClothingSeasonSchema } from "@/modules/wardrobe/server/schema";

export const GenerateOutfitSchema = z.object({
  occasion: ClothingOccasionSchema.default("CASUAL"),
  season: ClothingSeasonSchema.optional(),
  weatherDescription: z.string().max(200).optional(),
  stylePreference: z.string().max(200).optional(),
  count: z.number().min(1).max(5).default(3),
});

export const SaveOutfitSchema = z.object({
  name: z.string().min(1).max(200),
  occasion: ClothingOccasionSchema.default("CASUAL"),
  season: ClothingSeasonSchema.default("ALL_SEASON"),
  itemIds: z.array(z.string().cuid()).min(1).max(20),
  aiNotes: z.string().max(1000).optional(),
});

export const ListSavedOutfitsSchema = z.object({
  isFavorite: z.boolean().optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
});

export type GenerateOutfitInput = z.infer<typeof GenerateOutfitSchema>;
export type SaveOutfitInput = z.infer<typeof SaveOutfitSchema>;
