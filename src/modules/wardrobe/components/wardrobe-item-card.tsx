"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { formatDistanceToNow } from "date-fns";
import { CheckCheck, Trash2, ShirtIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WardrobeItem } from "@prisma/client";

interface Props {
  item: WardrobeItem;
  onUpdate: () => void;
}

export function WardrobeItemCard({ item, onUpdate }: Props) {
  const [hovering, setHovering] = useState(false);

  const markWorn = api.wardrobe.markWorn.useMutation({ onSuccess: onUpdate });
  const deleteItem = api.wardrobe.delete.useMutation({ onSuccess: onUpdate });

  return (
    <div
      className="relative group rounded-xl overflow-hidden border border-border/50 bg-card hover:border-border transition-colors"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Image or placeholder */}
      <div className="aspect-square bg-accent/20 flex items-center justify-center relative overflow-hidden">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ShirtIcon className="w-12 h-12 text-muted-foreground/40" strokeWidth={1} />
        )}

        {item.needsLaundry && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-500/90 text-white">
            Laundry
          </span>
        )}

        {/* Hover actions */}
        {hovering && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 animate-in fade-in duration-150">
            <button
              onClick={() => markWorn.mutate({ id: item.id })}
              disabled={markWorn.isPending}
              className="p-2 rounded-full bg-white/90 text-black hover:bg-white transition-colors"
              title="Mark as worn"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm("Delete this item?")) {
                  deleteItem.mutate({ id: item.id });
                }
              }}
              disabled={deleteItem.isPending}
              className="p-2 rounded-full bg-white/90 text-red-600 hover:bg-white transition-colors"
              title="Delete item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <p className="text-sm font-medium truncate">{item.name}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {item.category.toLowerCase()}
          </span>
          {item.colors.length > 0 && (
            <div className="flex gap-1">
              {item.colors.slice(0, 3).map((c) => (
                <span key={c} className="text-[10px] text-muted-foreground">{c}</span>
              ))}
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground/60">
          {item.lastWornAt
            ? `Worn ${formatDistanceToNow(new Date(item.lastWornAt), { addSuffix: true })}`
            : "Never worn"}
        </p>
      </div>
    </div>
  );
}
