import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import { createLogger } from "@/lib/logger";
import type {
  CreateWardrobeItemInput,
  UpdateWardrobeItemInput,
  ListWardrobeItemsInput,
} from "./schema";

const logger = createLogger("wardrobe");

export async function createWardrobeItem(userId: string, input: CreateWardrobeItemInput) {
  const item = await db.wardrobeItem.create({
    data: {
      userId,
      name: input.name,
      description: input.description,
      category: input.category,
      season: input.season,
      occasion: input.occasion,
      colors: input.colors,
      brand: input.brand,
      imageUrl: input.imageUrl,
      storageKey: input.storageKey,
      metadata: input.metadata as object | undefined,
    },
  });
  logger.info({ itemId: item.id, userId }, "wardrobe item created");
  return item;
}

export async function updateWardrobeItem(
  userId: string,
  itemId: string,
  input: UpdateWardrobeItemInput
) {
  const existing = await db.wardrobeItem.findFirst({
    where: { id: itemId, userId, isActive: true },
  });
  if (!existing) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
  }
  return db.wardrobeItem.update({
    where: { id: itemId },
    data: {
      name: input.name,
      description: input.description,
      category: input.category,
      season: input.season,
      occasion: input.occasion,
      colors: input.colors,
      brand: input.brand,
      imageUrl: input.imageUrl,
      needsLaundry: input.needsLaundry,
    },
  });
}

export async function deleteWardrobeItem(userId: string, itemId: string) {
  const existing = await db.wardrobeItem.findFirst({
    where: { id: itemId, userId },
  });
  if (!existing) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
  }
  return db.wardrobeItem.update({
    where: { id: itemId },
    data: { isActive: false },
  });
}

export async function markItemWorn(userId: string, itemId: string) {
  const existing = await db.wardrobeItem.findFirst({
    where: { id: itemId, userId, isActive: true },
  });
  if (!existing) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
  }
  return db.wardrobeItem.update({
    where: { id: itemId },
    data: { lastWornAt: new Date(), needsLaundry: false },
  });
}

export async function listWardrobeItems(userId: string, input: ListWardrobeItemsInput) {
  const where = {
    userId,
    isActive: true,
    ...(input.category && { category: input.category }),
    ...(input.season && { season: input.season }),
    ...(input.occasion && { occasion: input.occasion }),
    ...(input.cursor && { id: { lt: input.cursor } }),
  };

  const items = await db.wardrobeItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: input.limit + 1,
  });

  const hasMore = items.length > input.limit;
  const data = hasMore ? items.slice(0, input.limit) : items;
  const nextCursor = hasMore ? data[data.length - 1]?.id : undefined;

  return { items: data, nextCursor };
}

export async function getWardrobeItem(userId: string, itemId: string) {
  const item = await db.wardrobeItem.findFirst({
    where: { id: itemId, userId, isActive: true },
  });
  if (!item) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
  }
  return item;
}

export async function getWardrobeStats(userId: string) {
  const [total, byCategory, needsLaundry] = await Promise.all([
    db.wardrobeItem.count({ where: { userId, isActive: true } }),
    db.wardrobeItem.groupBy({
      by: ["category"],
      where: { userId, isActive: true },
      _count: { id: true },
    }),
    db.wardrobeItem.count({ where: { userId, isActive: true, needsLaundry: true } }),
  ]);

  return { total, byCategory, needsLaundry };
}
