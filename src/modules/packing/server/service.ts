import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import { createLogger } from "@/lib/logger";
import { env } from "@/env.js";
import type { CreatePackingListInput } from "./schema";
import type { WardrobeItem } from "@prisma/client";

const logger = createLogger("packing");

interface PackingItemSuggestion {
  itemName: string;
  fromWardrobe: boolean;
  quantity: number;
  reason: string;
}

function buildPackingPrompt(items: WardrobeItem[], input: CreatePackingListInput): string {
  const itemList = items
    .map((i) => `- ${i.name} (${i.category}, ${i.season}, ${i.occasion})`)
    .join("\n");

  return `You are a travel packing expert. Create a smart packing list for this trip using the user's wardrobe.

Trip details:
- Destination: ${input.destination}
- Duration: ${input.durationDays} days
- Activities: ${input.activities.join(", ") || "general travel"}
${input.weatherDescription ? `- Weather: ${input.weatherDescription}` : ""}

Available wardrobe items:
${itemList}

Return a JSON array of items to pack: { "itemName": string, "fromWardrobe": boolean, "quantity": number, "reason": string }
Include essential items not in wardrobe (toiletries, etc.) with fromWardrobe: false.
Return ONLY valid JSON array.`;
}

async function callAIForPacking(
  prompt: string,
  items: WardrobeItem[]
): Promise<PackingItemSuggestion[]> {
  const hasAI = env.OPENAI_API_KEY ?? env.OPENROUTER_API_KEY ?? env.ANTHROPIC_API_KEY;
  if (!hasAI) {
    return generateMockPackingList(items);
  }

  try {
    const { generateText } = await import("ai");

    let model;
    if (env.OPENROUTER_API_KEY) {
      const { createOpenRouter } = await import("@openrouter/ai-sdk-provider");
      const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });
      model = openrouter("anthropic/claude-haiku-4-5");
    } else if (env.OPENAI_API_KEY) {
      const { createOpenAI } = await import("@ai-sdk/openai");
      const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY, baseURL: env.OPENAI_BASE_URL });
      model = openai("gpt-4o-mini");
    } else {
      return generateMockPackingList(items);
    }

    const { text } = await generateText({ model, prompt, maxTokens: 1500 });
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as PackingItemSuggestion[];
    }
  } catch (err) {
    logger.warn({ err }, "AI call failed, using mock packing list");
  }

  return generateMockPackingList(items);
}

function generateMockPackingList(items: WardrobeItem[]): PackingItemSuggestion[] {
  const list: PackingItemSuggestion[] = [];
  const tops = items.filter((i) => i.category === "TOPS").slice(0, 3);
  const bottoms = items.filter((i) => i.category === "BOTTOMS").slice(0, 2);
  const shoes = items.filter((i) => i.category === "SHOES").slice(0, 2);

  tops.forEach((item) => list.push({ itemName: item.name, fromWardrobe: true, quantity: 1, reason: "Essential top" }));
  bottoms.forEach((item) => list.push({ itemName: item.name, fromWardrobe: true, quantity: 1, reason: "Essential bottom" }));
  shoes.forEach((item) => list.push({ itemName: item.name, fromWardrobe: true, quantity: 1, reason: "Footwear" }));
  list.push(
    { itemName: "Toiletry bag", fromWardrobe: false, quantity: 1, reason: "Personal care" },
    { itemName: "Phone charger", fromWardrobe: false, quantity: 1, reason: "Electronics" },
    { itemName: "Travel adapter", fromWardrobe: false, quantity: 1, reason: "Power compatibility" }
  );

  return list;
}

export async function createPackingList(userId: string, input: CreatePackingListInput) {
  const wardrobeItems = await db.wardrobeItem.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const prompt = buildPackingPrompt(wardrobeItems, input);
  const suggestions = await callAIForPacking(prompt, wardrobeItems);

  const itemsByName = new Map(wardrobeItems.map((i) => [i.name.toLowerCase(), i]));

  const packingList = await db.packingList.create({
    data: {
      userId,
      name: input.name,
      destination: input.destination,
      durationDays: input.durationDays,
      activities: input.activities,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      aiNotes: `Generated for ${input.durationDays}-day trip to ${input.destination}`,
      items: {
        create: suggestions.map((s, idx) => {
          const matchedItem = s.fromWardrobe ? itemsByName.get(s.itemName.toLowerCase()) : undefined;
          return { itemId: matchedItem?.id, customName: matchedItem ? undefined : s.itemName, sortOrder: idx };
        }),
      },
    },
    include: { items: { orderBy: { sortOrder: "asc" }, include: { item: true } } },
  });

  logger.info({ packingListId: packingList.id, userId }, "packing list created");
  return packingList;
}

export async function listPackingLists(userId: string, input: { cursor?: string; limit: number }) {
  const lists = await db.packingList.findMany({
    where: { userId, ...(input.cursor && { id: { lt: input.cursor } }) },
    orderBy: { createdAt: "desc" },
    take: input.limit + 1,
    include: { items: { orderBy: { sortOrder: "asc" }, include: { item: true } } },
  });

  const hasMore = lists.length > input.limit;
  const data = hasMore ? lists.slice(0, input.limit) : lists;
  return { lists: data, nextCursor: hasMore ? data[data.length - 1]?.id : undefined };
}

export async function getPackingList(userId: string, listId: string) {
  const list = await db.packingList.findFirst({
    where: { id: listId, userId },
    include: { items: { orderBy: { sortOrder: "asc" }, include: { item: true } } },
  });
  if (!list) throw new TRPCError({ code: "NOT_FOUND", message: "Packing list not found" });
  return list;
}

export async function togglePackedItem(userId: string, packingListItemId: string) {
  const item = await db.packingListItem.findFirst({
    where: { id: packingListItemId, packingList: { userId } },
  });
  if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
  return db.packingListItem.update({ where: { id: packingListItemId }, data: { isPacked: !item.isPacked } });
}

export async function addPackingItem(
  userId: string,
  input: { packingListId: string; itemId?: string; customName?: string }
) {
  const list = await db.packingList.findFirst({ where: { id: input.packingListId, userId } });
  if (!list) throw new TRPCError({ code: "NOT_FOUND", message: "Packing list not found" });

  const count = await db.packingListItem.count({ where: { packingListId: input.packingListId } });
  return db.packingListItem.create({
    data: { packingListId: input.packingListId, itemId: input.itemId, customName: input.customName, sortOrder: count },
    include: { item: true },
  });
}

export async function deletePackingList(userId: string, listId: string) {
  const list = await db.packingList.findFirst({ where: { id: listId, userId } });
  if (!list) throw new TRPCError({ code: "NOT_FOUND", message: "Packing list not found" });
  await db.packingList.delete({ where: { id: listId } });
}
