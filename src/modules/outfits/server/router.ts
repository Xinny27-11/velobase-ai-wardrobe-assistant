import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  GenerateOutfitSchema,
  SaveOutfitSchema,
  ListSavedOutfitsSchema,
} from "./schema";
import {
  generateOutfits,
  saveOutfit,
  toggleOutfitFavorite,
  deleteSavedOutfit,
  listSavedOutfits,
} from "./service";

export const outfitsRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(GenerateOutfitSchema)
    .mutation(({ ctx, input }) =>
      generateOutfits(ctx.session.user.id, input)
    ),

  save: protectedProcedure
    .input(SaveOutfitSchema)
    .mutation(({ ctx, input }) =>
      saveOutfit(ctx.session.user.id, input)
    ),

  toggleFavorite: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) =>
      toggleOutfitFavorite(ctx.session.user.id, input.id)
    ),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) =>
      deleteSavedOutfit(ctx.session.user.id, input.id)
    ),

  list: protectedProcedure
    .input(ListSavedOutfitsSchema.optional())
    .query(({ ctx, input }) =>
      listSavedOutfits(ctx.session.user.id, input ?? { limit: 20 })
    ),
});
