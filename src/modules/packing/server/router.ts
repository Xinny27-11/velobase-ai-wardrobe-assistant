import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { CreatePackingListSchema, AddPackingItemSchema } from "./schema";
import {
  createPackingList,
  listPackingLists,
  getPackingList,
  togglePackedItem,
  addPackingItem,
  deletePackingList,
} from "./service";

export const packingRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreatePackingListSchema)
    .mutation(({ ctx, input }) =>
      createPackingList(ctx.session.user.id, input)
    ),

  list: protectedProcedure
    .input(z.object({ cursor: z.string().optional(), limit: z.number().default(20) }).optional())
    .query(({ ctx, input }) =>
      listPackingLists(ctx.session.user.id, input ?? { limit: 20 })
    ),

  get: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(({ ctx, input }) =>
      getPackingList(ctx.session.user.id, input.id)
    ),

  togglePacked: protectedProcedure
    .input(z.object({ packingListItemId: z.string().cuid() }))
    .mutation(({ ctx, input }) =>
      togglePackedItem(ctx.session.user.id, input.packingListItemId)
    ),

  addItem: protectedProcedure
    .input(AddPackingItemSchema)
    .mutation(({ ctx, input }) =>
      addPackingItem(ctx.session.user.id, input)
    ),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) =>
      deletePackingList(ctx.session.user.id, input.id)
    ),
});
