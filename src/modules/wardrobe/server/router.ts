import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  CreateWardrobeItemSchema,
  UpdateWardrobeItemSchema,
  ListWardrobeItemsSchema,
} from "./schema";
import {
  createWardrobeItem,
  updateWardrobeItem,
  deleteWardrobeItem,
  markItemWorn,
  listWardrobeItems,
  getWardrobeItem,
  getWardrobeStats,
} from "./service";

export const wardrobeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateWardrobeItemSchema)
    .mutation(({ ctx, input }) =>
      createWardrobeItem(ctx.session.user.id, input)
    ),

  update: protectedProcedure
    .input(z.object({ id: z.string().cuid(), data: UpdateWardrobeItemSchema }))
    .mutation(({ ctx, input }) =>
      updateWardrobeItem(ctx.session.user.id, input.id, input.data)
    ),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) =>
      deleteWardrobeItem(ctx.session.user.id, input.id)
    ),

  markWorn: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) =>
      markItemWorn(ctx.session.user.id, input.id)
    ),

  list: protectedProcedure
    .input(ListWardrobeItemsSchema.optional())
    .query(({ ctx, input }) =>
      listWardrobeItems(ctx.session.user.id, input ?? { limit: 20 })
    ),

  get: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(({ ctx, input }) =>
      getWardrobeItem(ctx.session.user.id, input.id)
    ),

  stats: protectedProcedure.query(({ ctx }) =>
    getWardrobeStats(ctx.session.user.id)
  ),
});
