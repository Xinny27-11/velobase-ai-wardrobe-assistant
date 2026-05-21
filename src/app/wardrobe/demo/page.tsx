"use client";

import Link from "next/link";
import { Camera, Sparkles, Luggage, ArrowRight, ShirtIcon, CheckCheck } from "lucide-react";
import { useLogin } from "@/components/auth/use-login";
import { useSession } from "next-auth/react";

const DEMO_ITEMS = [
  { name: "White Linen Shirt", category: "TOPS", color: "#f9f9f9", colors: ["white"] },
  { name: "Navy Chinos", category: "BOTTOMS", color: "#1a2f5a", colors: ["navy"] },
  { name: "Leather Sneakers", category: "SHOES", color: "#c8a882", colors: ["beige"] },
  { name: "Denim Jacket", category: "OUTERWEAR", color: "#4a5568", colors: ["denim"] },
  { name: "Black Tee", category: "TOPS", color: "#1a1a1a", colors: ["black"] },
  { name: "Khaki Shorts", category: "BOTTOMS", color: "#c8b97a", colors: ["khaki"] },
];

const DEMO_OUTFIT = {
  name: "Smart Casual Friday",
  items: ["White Linen Shirt", "Navy Chinos", "Leather Sneakers"],
  notes: "Perfect for a casual Friday at the office or weekend brunch. The white linen breathes well and the navy creates a polished look.",
};

export default function DemoPage() {
  const { data: session } = useSession();
  const { openLogin } = useLogin();

  const handleCta = () => {
    if (session) {
      window.location.href = "/wardrobe";
    } else {
      openLogin();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block">
            ← Back to home
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight mb-4">See How StyleAI Works</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Scan your clothes, get AI outfit suggestions, and pack smarter for every trip.
          </p>
        </div>

        {/* Step 1: Digital Wardrobe Scanner */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <h2 className="text-xl font-semibold">Digital Wardrobe Scanner</h2>
              <p className="text-muted-foreground text-sm">Photograph clothes → instant digital wardrobe</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {DEMO_ITEMS.map((item) => (
              <div key={item.name} className="group rounded-xl border border-border overflow-hidden bg-card">
                <div
                  className="aspect-square flex items-center justify-center"
                  style={{ backgroundColor: item.color + "33" }}
                >
                  <ShirtIcon
                    className="w-10 h-10"
                    strokeWidth={1}
                    style={{ color: item.color }}
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.category.toLowerCase()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-emerald-500">
            <CheckCheck className="w-4 h-4" />
            <span>6 items automatically categorized, colored & tagged</span>
          </div>
        </div>

        {/* Step 2: AI Outfit Suggestions */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <h2 className="text-xl font-semibold">Smart Outfit Recommendations</h2>
              <p className="text-muted-foreground text-sm">AI curates outfits from your wardrobe</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="font-medium">{DEMO_OUTFIT.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">Occasion: Casual</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {DEMO_OUTFIT.items.map((item) => (
                <span key={item} className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-sm">{item}</span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground italic">{DEMO_OUTFIT.notes}</p>
          </div>
        </div>

        {/* Step 3: Packing */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <h2 className="text-xl font-semibold">Intelligent Trip Packing</h2>
              <p className="text-muted-foreground text-sm">Tell us your trip, we build your packing list</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Luggage className="w-5 h-5 text-emerald-500" />
              <span className="font-medium">Tokyo, Japan — 7 days</span>
              <span className="ml-auto text-xs text-muted-foreground">4/8 packed</span>
            </div>
            <div className="h-1.5 bg-border rounded-full mb-4">
              <div className="h-full w-1/2 bg-emerald-500 rounded-full" />
            </div>
            <div className="space-y-2">
              {[
                { name: "White Linen Shirt", packed: true },
                { name: "Navy Chinos", packed: true },
                { name: "Black Tee", packed: true },
                { name: "Leather Sneakers", packed: true },
                { name: "Denim Jacket", packed: false },
                { name: "Khaki Shorts", packed: false },
                { name: "Toiletry bag", packed: false },
                { name: "Travel adapter", packed: false },
              ].map((item) => (
                <div key={item.name} className={`flex items-center gap-3 py-1 ${item.packed ? "opacity-50" : ""}`}>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${item.packed ? "bg-emerald-500 border-emerald-500" : "border-border"}`}>
                    {item.packed && <CheckCheck className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-sm ${item.packed ? "line-through" : ""}`}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-card border border-border rounded-2xl p-10">
          <h2 className="text-2xl font-semibold mb-3">Ready to start?</h2>
          <p className="text-muted-foreground mb-6">Sign up free and start building your digital wardrobe today.</p>
          <button
            onClick={handleCta}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
