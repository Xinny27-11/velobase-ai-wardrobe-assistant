import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import { createLogger } from "@/lib/logger";
import { env } from "@/env.js";
import type { GenerateOutfitInput, SaveOutfitInput } from "./schema";
import type { WardrobeItem } from "@prisma/client";

const logger = createLogger("outfits");

export interface OutfitSuggestion {
  name: string;
  items: WardrobeItem[];
  aiNotes: string;
  occasion: string;
  season: string;
}

function buildOutfitPrompt(items: WardrobeItem[], input: GenerateOutfitInput): string {
  const itemList = items
    .map(
      (i) =>
        `- ${i.name} (${i.category}, colors: ${i.colors.join(", ")}, season: ${i.season}, occasion: ${i.occasion})`
    )
    .join("\n");

  return `You are a professional fashion stylist. Create ${input.count} outfit suggestion(s) from the following wardrobe items.

Wardrobe items:
${itemList}

Requirements:
- Occasion: ${input.occasion}
${input.season ? `- Season: ${input.season}` : ""}
${input.weatherDescription ? `- Weather: ${input.weatherDescription}` : ""}
${input.stylePreference ? `- Style preference: ${input.stylePreference}` : ""}

For each outfit, return a JSON array with objects: { "name": string, "itemNames": string[], "notes": string }
Only use items from the provided list. Be creative but practical. Return ONLY valid JSON array.`;
}

async function callAIForOutfits(
  prompt: string,
  items: WardrobeItem[]
): Promise<Array<{ name: string; itemNames: string[]; notes: string }>> {
  const hasAI = env.OPENAI_API_KEY ?? env.OPENROUTER_API_KEY ?? env.ANTHROPIC_API_KEY;
  if (!hasAI) {
    return generateMockOutfits(items);
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
      return generateMockOutfits(items);
    }

    const { text } = await generateText({ model, prompt, maxTokens: 1024 });
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as Array<{ name: string; itemNames: string[]; notes: string }>;
    }
  } catch (err) {
    logger.warn({ err }, "AI call failed, using mock outfits");
  }

  return generateMockOutfits(items);
}

function generateMockOutfits(
  items: WardrobeItem[]
): Array<{ name: string; itemNames: string[]; notes: string }> {
  const tops = items.filter((i) => i.category === "TOPS");
  const bottoms = items.filter((i) => i.category === "BOTTOMS");
  const shoes = items.filter((i) => i.category === "SHOES");
  const outerwear = items.filter((i) => i.category === "OUTERWEAR");

  const outfits: Array<{ name: string; itemNames: string[]; notes: string }> = [];

  if (tops.length > 0 && bottoms.length > 0) {
    const top = tops[Math.floor(Math.random() * tops.length)]!;
    const bottom = bottoms[Math.floor(Math.random() * bottoms.length)]!;
    const names = [top.name, bottom.name];
    if (shoes.length > 0) names.push(shoes[0]!.name);
    outfits.push({
      name: "Classic Casual Look",
      itemNames: names,
      notes: "A clean, versatile combination that works for everyday wear.",
    });
  }

  if (tops.length > 1 && bottoms.length > 0) {
    const top = tops[Math.floor(Math.random() * tops.length)]!;
    const bottom = bottoms[Math.floor(Math.random() * bottoms.length)]!;
    const names = [top.name, bottom.name];
    if (outerwear.length > 0) names.push(outerwear[0]!.name);
    outfits.push({
      name: "Layered Style",
      itemNames: names,
      notes: "Layer up for a stylish, put-together look.",
    });
  }

  if (outfits.length === 0 && items.length > 0) {
    outfits.push({
      name: "Featured Item",
      itemNames: [items[0]!.name],
      notes: "Add more wardrobe items to get full outfit suggestions.",
    });
  }

  return outfits;
}

export async function generateOutfits(userId: string, input: GenerateOutfitInput): Promise<OutfitSuggestion[]> {
  const items = await db.wardrobeItem.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  if (items.length === 0) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Add items to your wardrobe first",
    });
  }

  const prompt = buildOutfitPrompt(items, input);
  const suggestions = await callAIForOutfits(prompt, items);

  const itemsByName = new Map(items.map((i) => [i.name.toLowerCase(), i]));

  return suggestions.slice(0, input.count).map((s) => {
    const matchedItems = s.itemNames
      .map((name) => itemsByName.get(name.toLowerCase()))
      .filter(Boolean) as WardrobeItem[];

    return {
      name: s.name,
      items: matchedItems.length > 0 ? matchedItems : items.slice(0, 2),
      aiNotes: s.notes,
      occasion: input.occasion,
      season: input.season ?? "ALL_SEASON",
    };
  });
}

export async function saveOutfit(userId: string, input: SaveOutfitInput) {
  const items = await db.wardrobeItem.findMany({
    where: { id: { in: input.itemIds }, userId, isActive: true },
  });

  if (items.length !== input.itemIds.length) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Some items not found in your wardrobe",
    });
  }

  const outfit = await db.savedOutfit.create({
    data: {
      userId,
      name: input.name,
      occasion: input.occasion,
      season: input.season,
      aiNotes: input.aiNotes,
      items: {
        create: input.itemIds.map((itemId, idx) => ({ itemId, sortOrder: idx })),
      },
    },
    include: { items: { include: { item: true } } },
  });

  logger.info({ outfitId: outfit.id, userId }, "outfit saved");
  return outfit;
}

export async function toggleOutfitFavorite(userId: string, outfitId: string) {
  const outfit = await db.savedOutfit.findFirst({ where: { id: outfitId, userId } });
  if (!outfit) throw new TRPCError({ code: "NOT_FOUND", message: "Outfit not found" });
  return db.savedOutfit.update({ where: { id: outfitId }, data: { isFavorite: !outfit.isFavorite } });
}

export async function deleteSavedOutfit(userId: string, outfitId: string) {
  const outfit = await db.savedOutfit.findFirst({ where: { id: outfitId, userId } });
  if (!outfit) throw new TRPCError({ code: "NOT_FOUND", message: "Outfit not found" });
  await db.savedOutfit.delete({ where: { id: outfitId } });
}

export async function listSavedOutfits(
  userId: string,
  input: { isFavorite?: boolean; cursor?: string; limit: number }
) {
  const items = await db.savedOutfit.findMany({
    where: {
      userId,
      ...(input.isFavorite !== undefined && { isFavorite: input.isFavorite }),
      ...(input.cursor && { id: { lt: input.cursor } }),
    },
    orderBy: { createdAt: "desc" },
    take: input.limit + 1,
    include: {
      items: { orderBy: { sortOrder: "asc" }, include: { item: true } },
    },
  });

  const hasMore = items.length > input.limit;
  const data = hasMore ? items.slice(0, input.limit) : items;
  return { outfits: data, nextCursor: hasMore ? data[data.length - 1]?.id : undefined };
}
