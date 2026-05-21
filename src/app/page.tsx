"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Background } from "@/components/layout/background";
import { SiteFooter } from "@/components/layout/site-footer";
import { Features } from "@/components/landing/features";
import { useTranslations } from "next-intl";
import { useLogin } from "@/components/auth/use-login";
import { useSession } from "next-auth/react";
import { Camera, ArrowRight } from "lucide-react";

export default function HomePage() {
  const t = useTranslations("landing");
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
    <div className={cn(
      "w-full bg-background text-foreground font-sans selection:bg-primary/30 relative",
      "min-h-screen overflow-y-auto overflow-x-hidden"
    )}>
      <Background />
      <Header />

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center w-full px-4 pt-32 pb-16 min-h-[calc(100vh-80px)] justify-center">
        <div className="relative w-full max-w-4xl mx-auto text-center mb-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-accent/30 text-sm text-muted-foreground mb-4">
            <Camera className="w-3.5 h-3.5" />
            <span>Scan → Style → Wear</span>
          </div>

          <h1 className="font-poppins font-medium text-5xl md:text-7xl tracking-tight text-foreground drop-shadow-sm">
            {t("hero.titleLine1")}{" "}
            <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x">
              {t("hero.titleLine2")}
            </span>
          </h1>

          <p className="font-sans text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto font-light tracking-wide">
            {t("hero.subtitle")}
            <br className="hidden sm:block" />
            <span className="text-foreground/80">{t("hero.subtitleAccent")}</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleCta}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-foreground text-background font-medium text-base hover:opacity-90 transition-opacity"
            >
              {t("hero.cta")}
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/wardrobe/demo"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-border/60 text-foreground/80 font-medium text-base hover:bg-accent/40 transition-colors"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-16 flex flex-wrap justify-center gap-12 text-center animate-in fade-in duration-1000 delay-500 fill-mode-both">
          {[
            { value: "50K+", label: t("stats.items") },
            { value: "200K+", label: t("stats.outfits") },
            { value: "8K+", label: t("stats.users") },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-3xl font-semibold text-foreground">{value}</span>
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </main>

      <Features />

      {/* CTA Section */}
      <section className="w-full py-24 px-6 relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground">
            {t("cta.title")}
          </h2>
          <p className="text-lg text-muted-foreground font-light">{t("cta.subtitle")}</p>
          <button
            onClick={handleCta}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-foreground text-background font-medium text-base hover:opacity-90 transition-opacity"
          >
            {t("cta.button")}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
