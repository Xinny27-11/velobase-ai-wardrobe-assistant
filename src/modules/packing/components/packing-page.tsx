"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/trpc/react";
import { Luggage, Plus, Check, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PackingPage() {
  const t = useTranslations("packing");
  const [tab, setTab] = useState<"new" | "trips">("new");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState(7);
  const [activities, setActivities] = useState("");
  const [weather, setWeather] = useState("");

  const createList = api.packing.create.useMutation({
    onSuccess: () => {
      void refetchLists();
      setTab("trips");
      resetForm();
    },
  });

  const { data: listsData, refetch: refetchLists } = api.packing.list.useQuery({ limit: 20 });
  const togglePacked = api.packing.togglePacked.useMutation({ onSuccess: () => void refetchLists() });
  const deleteList = api.packing.delete.useMutation({ onSuccess: () => void refetchLists() });

  function resetForm() {
    setDestination("");
    setDuration(7);
    setActivities("");
    setWeather("");
  }

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    createList.mutate({
      name: `Trip to ${destination}`,
      destination,
      durationDays: duration,
      activities: activities.split(",").map((a) => a.trim()).filter(Boolean),
      weatherDescription: weather || undefined,
    });
  }

  const lists = listsData?.lists ?? [];
  const packedCount = (items: Array<{ isPacked: boolean }>) =>
    items.filter((i) => i.isPacked).length;

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <div className="flex gap-2">
            {(["new", "trips"] as const).map((t_) => (
              <button
                key={t_}
                onClick={() => setTab(t_)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm transition-colors",
                  tab === t_
                    ? "bg-foreground text-background"
                    : "bg-accent/40 text-foreground hover:bg-accent/60"
                )}
              >
                {t_ === "new" ? t("newTrip") : t("myTrips")}
              </button>
            ))}
          </div>
        </div>

        {tab === "new" && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("destination")}</label>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
                  placeholder={t("destinationPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  {t("duration")} <span className="text-foreground font-medium">{duration}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-foreground"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 day</span>
                  <span>30 days</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("activities")}</label>
                <input
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none"
                  placeholder={t("activitiesPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Weather (optional)</label>
                <input
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none"
                  placeholder="e.g. hot and humid, 30°C"
                />
              </div>

              {createList.error && (
                <p className="text-red-500 text-sm">{createList.error.message}</p>
              )}

              <button
                type="submit"
                disabled={createList.isPending || !destination}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {createList.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("generating")}
                  </>
                ) : (
                  <>
                    <Luggage className="w-4 h-4" />
                    {t("generate")}
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {tab === "trips" && (
          <div className="space-y-4">
            {lists.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Luggage className="w-10 h-10 mx-auto mb-3 opacity-30" strokeWidth={1} />
                <p>{t("noTrips")}</p>
                <button
                  onClick={() => setTab("new")}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm hover:bg-accent/30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t("newTrip")}
                </button>
              </div>
            ) : (
              lists.map((list) => (
                <div key={list.id} className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium">{list.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {list.durationDays} days · {packedCount(list.items)}/{list.items.length} packed
                      </p>
                    </div>
                    <button
                      onClick={() => { if (confirm("Delete this packing list?")) deleteList.mutate({ id: list.id }); }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-border rounded-full mb-4">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${list.items.length > 0 ? (packedCount(list.items) / list.items.length) * 100 : 0}%` }}
                    />
                  </div>

                  <div className="space-y-2">
                    {list.items.map((pItem) => (
                      <div
                        key={pItem.id}
                        className={cn(
                          "flex items-center gap-3 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-accent/20 transition-colors",
                          pItem.isPacked && "opacity-50"
                        )}
                        onClick={() => togglePacked.mutate({ packingListItemId: pItem.id })}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                          pItem.isPacked
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-border"
                        )}>
                          {pItem.isPacked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </div>
                        <span className={cn("text-sm", pItem.isPacked && "line-through")}>
                          {pItem.item?.name ?? pItem.customName ?? "Item"}
                        </span>
                        {pItem.item && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {pItem.item.category.toLowerCase()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
