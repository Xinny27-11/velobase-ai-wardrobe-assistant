"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShirtIcon, Sparkles, Luggage, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { VibeLogo } from "@/components/ui/vibe-logo";

const NAV_ITEMS = [
  { href: "/wardrobe", icon: ShirtIcon, label: "My Wardrobe" },
  { href: "/outfits", icon: Sparkles, label: "Outfits" },
  { href: "/packing", icon: Luggage, label: "Packing" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-border/50 bg-background flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-border/50">
        <Link href="/">
          <VibeLogo size="sm" className="text-foreground" />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border/50">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <Home className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          Home
        </Link>
      </div>
    </aside>
  );
}
