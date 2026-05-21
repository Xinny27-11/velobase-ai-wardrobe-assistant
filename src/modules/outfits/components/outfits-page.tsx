"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/trpc/react";
import { Sparkles, Heart, Trash2, Loader2, ShirtIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClothingOccasion, ClothingSeason } from "@prisma/client";
import type { OutfitSuggestion } from "@/modules/outfits/server/service";

const OCCASIONS: ClothingOccasion[] = ["CASUAL", "WORK", "FORMAL", "SPORT", "PARTY"];

export function OutfitsPage() {
  const t = useTranslations("outfits");
  const [occasion, setOccasion] = useState<ClothingOccasion>("CASUAL");
  const [weather, setWeather] = useState("");
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [tab, setTab] = useState<"generate" | "saved">("generate");

  const generate = api.outfits.generate.useMutation({
    onSuccess: (data) => setSuggestions(data),
  });

  const { data: savedData, refetch: refetchSaved } = api.outfits.list.useQuery({ limit: 20 });
  const saveOutfit = api.outfits.save.useMutation({ onSuccess: () => void refetchSaved() });
  const toggleFav = api.outfits.toggleFavorite.useMutation({ onSuccess: () => void refetchSaved() });
  const deleteOutfit = api.outfits.delete.useMutation({ onSuccess: () => void refetchSaved() });

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <div className="flex gap-2">
            {(["generate", "saved"] as const).map((tab_) => (
              <button
                key={tab_}
                onClick={() => setTab(tab_)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm transition-colors",
                  tab === tab_
                    ? "bg-foreground text-background"
                    : "bg-accent/40 text-foreground hover:bg-accent/60"
                )}
              >
                {tab_ === "generate" ? t("generate") : t("savedOutfits")}
              </button>
            ))}
          </div>
        </div>

        {tab === "generate" && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("occasionLabel")}</label>
                  <div className="flex flex-wrap gap-2">
                    {OCCASIONS.map((occ) => (
                      <button
                        key={occ}
                        onClick={() => setOccasion(occ)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs transition-colors",
                          occasion === occ
                            ? "bg-foreground text-background"
                            : "bg-accent/40 hover:bg-accent/60"
                        )}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("weatherLabel")}</label>
                  <input
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none"
                    placeholder="e.g. warm and sunny, 25°C"
                  />
                </div>
              </div>

              <button
                onClick={() => generate.mutate({ occasion, weatherDescription: weather || undefined, count: 3 })}
                disabled={generate.isPending}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {generate.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("generating")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {t("generate")}
                  </>
                )}
              </button>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-4">
                {suggestions.map((outfit, idx) => (
                  <OutfitSuggestionCard
                    key={idx}
                    outfit={outfit}
                    onSave={() =>
                      saveOutfit.mutate({
                        name: outfit.name,
                        occasion: outfit.occasion as ClothingOccasion,
                        season: outfit.season as ClothingSeason,
                        itemIds: outfit.items.map((i) => i.id),
                        aiNotes: outfit.aiNotes,
                      })
                    }
                    isSaving={saveOutfit.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "saved" && (
          <div className="space-y-4">
            {(savedData?.outfits ?? []).length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <ShirtIcon className="w-10 h-10 mx-auto mb-3 opacity-30" strokeWidth={1} />
                <p>{t("noSaved")}</p>
              </div>
            ) : (
              savedData?.outfits.map((outfit) => (
                <div key={outfit.id} className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{outfit.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {outfit.occasion} · {outfit.season.replace("_", " ")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleFav.mutate({ id: outfit.id })}
                        className={cn("p-1.5 rounded-lg transition-colors", outfit.isFavorite ? "text-red-500" : "text-muted-foreground hover:text-red-400")}
                      >
                        <Heart className="w-4 h-4" fill={outfit.isFavorite ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => { if (confirm("Delete this outfit?")) deleteOutfit.mutate({ id: outfit.id }); }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {outfit.items.map((oi) => (
                      <span key={oi.id} className="px-2 py-0.5 rounded-md bg-accent/40 text-xs">
                        {oi.item.name}
                      </span>
                    ))}
                  </div>
                  {outfit.aiNotes && (
                    <p className="text-xs text-muted-foreground mt-3 italic">{outfit.aiNotes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OutfitSuggestionCard({
  outfit,
  onSave,
  isSaving,
}: {
  outfit: OutfitSuggestion;
  onSave: () => void;
  isSaving: boolean;
}) {
  const t = useTranslations("outfits");

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium">{outfit.name}</h3>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Heart className="w-3 h-3" />}
          {t("save")}
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {outfit.items.map((item) => (
          <div key={item.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/30 text-sm">
            <ShirtIcon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
            <span>{item.name}</span>
          </div>
        ))}
      </div>
      {outfit.aiNotes && (
        <p className="text-sm text-muted-foreground italic">{outfit.aiNotes}</p>
      )}
    </div>
  );
}
