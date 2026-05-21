"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/trpc/react";
import { Plus, Filter, Shirt, RefreshCw, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddItemDialog } from "./add-item-dialog";
import { WardrobeItemCard } from "./wardrobe-item-card";
import type { ClothingCategory, ClothingSeason } from "@prisma/client";

const CATEGORIES = ["TOPS", "BOTTOMS", "DRESSES", "OUTERWEAR", "SHOES", "ACCESSORIES"] as const;
const SEASONS = ["SPRING", "SUMMER", "FALL", "WINTER", "ALL_SEASON"] as const;

export function WardrobePage() {
  const t = useTranslations("wardrobe");
  const [addOpen, setAddOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<ClothingCategory | undefined>();
  const [seasonFilter, setSeasonFilter] = useState<ClothingSeason | undefined>();

  const { data, isLoading, refetch } = api.wardrobe.list.useQuery({
    category: categoryFilter,
    season: seasonFilter,
    limit: 50,
  });

  const { data: stats } = api.wardrobe.stats.useQuery();

  const items = data?.items ?? [];

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
            {stats && (
              <p className="text-muted-foreground mt-1 text-sm">
                {stats.total} items · {stats.needsLaundry} need laundering
              </p>
            )}
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            {t("addItem")}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <button
              onClick={() => setCategoryFilter(undefined)}
              className={cn(
                "px-3 py-1 rounded-full text-sm transition-colors",
                !categoryFilter
                  ? "bg-foreground text-background"
                  : "bg-accent/40 text-foreground hover:bg-accent/60"
              )}
            >
              {t("filter.all")}
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat === categoryFilter ? undefined : cat)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm transition-colors",
                  categoryFilter === cat
                    ? "bg-foreground text-background"
                    : "bg-accent/40 text-foreground hover:bg-accent/60"
                )}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Season filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {SEASONS.map((season) => (
            <button
              key={season}
              onClick={() => setSeasonFilter(season === seasonFilter ? undefined : season)}
              className={cn(
                "px-3 py-1 rounded-full text-xs transition-colors border",
                seasonFilter === season
                  ? "border-foreground text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/50"
              )}
            >
              {season.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/40 flex items-center justify-center">
              <Shirt className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">{t("empty")}</h3>
            <p className="text-muted-foreground text-sm max-w-sm">{t("emptyDesc")}</p>
            <button
              onClick={() => setAddOpen(true)}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              {t("addItem")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <WardrobeItemCard key={item.id} item={item} onUpdate={() => refetch()} />
            ))}
          </div>
        )}
      </div>

      <AddItemDialog open={addOpen} onClose={() => setAddOpen(false)} onSuccess={() => { setAddOpen(false); void refetch(); }} />
    </div>
  );
}
