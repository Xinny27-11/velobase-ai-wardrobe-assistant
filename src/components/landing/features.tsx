"use client";

import { Camera, Sparkles, ShirtIcon, Luggage } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const featureKeys = [
  { key: "scanner", icon: Camera, color: "text-blue-500" },
  { key: "outfits", icon: Sparkles, color: "text-purple-500" },
  { key: "tryon", icon: ShirtIcon, color: "text-pink-500" },
  { key: "packing", icon: Luggage, color: "text-emerald-500" },
] as const;

export function Features() {
  const t = useTranslations("landing.features");

  return (
    <section className="w-full py-32 px-6 relative overflow-hidden bg-background">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-sm font-medium text-blue-500 tracking-widest uppercase mb-6">
              {t("sectionLabel")}
            </h2>
            <h3 className="text-4xl md:text-6xl font-medium tracking-tight text-foreground leading-[1.1]">
              {t("sectionTitle")} <br />
              <span className="text-muted-foreground">{t("sectionSubtitle")}</span>
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {featureKeys.map(({ key, icon: Icon, color }) => (
            <div key={key} className="group flex flex-col items-start">
              <div className="w-full h-[1px] bg-border/50 mb-8 relative overflow-hidden">
                <div className="absolute inset-0 w-full h-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out bg-foreground" />
              </div>
              <div className={cn(
                "mb-6 p-3 -ml-3 rounded-full bg-transparent group-hover:bg-accent/50 transition-colors duration-300",
                color
              )}>
                <Icon className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h4 className="text-xl font-medium mb-3 text-foreground tracking-tight group-hover:translate-x-1 transition-transform duration-300">
                {t(`${key}.title`)}
              </h4>
              <p className="text-muted-foreground leading-relaxed font-light text-base">
                {t(`${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
