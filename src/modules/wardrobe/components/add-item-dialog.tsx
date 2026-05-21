"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/trpc/react";
import { X, Loader2, Upload } from "lucide-react";
import type { ClothingCategory, ClothingSeason, ClothingOccasion } from "@prisma/client";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES: ClothingCategory[] = ["TOPS", "BOTTOMS", "DRESSES", "OUTERWEAR", "SHOES", "ACCESSORIES", "OTHER"];
const SEASONS: ClothingSeason[] = ["SPRING", "SUMMER", "FALL", "WINTER", "ALL_SEASON"];
const OCCASIONS: ClothingOccasion[] = ["CASUAL", "WORK", "FORMAL", "SPORT", "PARTY", "OTHER"];

export function AddItemDialog({ open, onClose, onSuccess }: Props) {
  const t = useTranslations("wardrobe.upload");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ClothingCategory>("TOPS");
  const [season, setSeason] = useState<ClothingSeason>("ALL_SEASON");
  const [occasion, setOccasion] = useState<ClothingOccasion>("CASUAL");
  const [colors, setColors] = useState("");
  const [brand, setBrand] = useState("");

  const create = api.wardrobe.create.useMutation({
    onSuccess: () => {
      onSuccess();
      resetForm();
    },
  });

  function resetForm() {
    setName("");
    setCategory("TOPS");
    setSeason("ALL_SEASON");
    setOccasion("CASUAL");
    setColors("");
    setBrand("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      name,
      category,
      season,
      occasion,
      colors: colors.split(",").map((c) => c.trim()).filter(Boolean),
      brand: brand || undefined,
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent/40 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload area placeholder */}
        <div className="border-2 border-dashed border-border/60 rounded-xl p-8 mb-6 text-center text-muted-foreground hover:border-border transition-colors cursor-pointer">
          <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{t("dragDrop")}</p>
          <p className="text-xs mt-1 opacity-60">{t("or")} <span className="underline">{t("browse")}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("nameLabel")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
              placeholder="e.g. White linen shirt"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("categoryLabel")}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ClothingCategory)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("seasonLabel")}</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value as ClothingSeason)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none"
              >
                {SEASONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("occasionLabel")}</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value as ClothingOccasion)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none"
              >
                {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("colorLabel")}</label>
              <input
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none"
                placeholder="blue, white..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Brand (optional)</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none"
              placeholder="e.g. Zara"
            />
          </div>

          {create.error && (
            <p className="text-red-500 text-sm">{create.error.message}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent/30 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={create.isPending || !name}
              className="flex-1 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {create.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Add to Wardrobe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
