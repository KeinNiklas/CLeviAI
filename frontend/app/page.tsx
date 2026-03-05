"use client";

import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/LanguageContext";
import { ArrowRight, BookOpen, Brain, Upload } from "lucide-react";
import Link from "next/link";
import ShaderBackground from "@/components/ui/shader-background";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Home() {
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme === "dark";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-transparent text-foreground selection:bg-primary/20">
      <ShaderBackground className="fixed inset-0 w-full h-full -z-10" isDark={isDark} />

      <main className="container mx-auto px-4 z-10 flex flex-col items-center text-center space-y-8 py-20 mt-10">

        {/* Hero Title */}
        <h1 className="text-7xl md:text-9xl font-extrabold tracking-tighter animate-fade-in-up delay-75 mb-6">
          <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">CLeviAI</span>
        </h1>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl animate-fade-in-up delay-100">
          {t.hero.title_start} <br />
          <span className="text-foreground">{t.hero.title_gradient}</span>
        </h2>

        {/* Glass Subtitle Block */}
        <div className="animate-fade-in-up delay-200 max-w-2xl w-full">
          <div
            className="rounded-2xl px-8 py-5 border"
            style={{
              background: isDark
                ? "rgba(15, 10, 5, 0.55)"
                : "rgba(255, 247, 237, 0.65)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderColor: isDark
                ? "rgba(249, 115, 22, 0.2)"
                : "rgba(234, 88, 12, 0.25)",
              boxShadow: isDark
                ? "0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
                : "0 4px 24px rgba(234,88,12,0.1), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            <p className="text-lg md:text-xl font-medium leading-relaxed" style={{ color: isDark ? "rgba(248,250,252,0.9)" : "rgba(15,23,42,0.85)" }}>
              {t.hero.subtitle}
            </p>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4 animate-fade-in-up delay-300">
          <Link href="/plan">
            <Button size="lg" className="group">
              {t.hero.cta_start}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="border-orange-500/50 hover:border-orange-500 hover:bg-orange-500/10 bg-background/50 backdrop-blur-md shadow-lg font-medium text-foreground">
              {t.navbar.profile_dashboard}
            </Button>
          </Link>
        </div>

        {/* Glass Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-5xl animate-fade-in-up delay-500">
          <GlassFeatureCard
            icon={<Upload className="w-6 h-6 text-orange-500" />}
            title={t.features.upload_title}
            description={t.features.upload_desc}
            isDark={isDark}
          />
          <GlassFeatureCard
            icon={<Brain className="w-6 h-6 text-amber-500" />}
            title={t.features.ai_title}
            description={t.features.ai_desc}
            isDark={isDark}
          />
          <GlassFeatureCard
            icon={<BookOpen className="w-6 h-6 text-yellow-500" />}
            title={t.features.course_title}
            description={t.features.course_desc}
            isDark={isDark}
          />
        </div>
      </main>
    </div>
  );
}

function GlassFeatureCard({
  icon,
  title,
  description,
  isDark,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  isDark: boolean;
}) {
  return (
    <div
      className="group relative rounded-2xl p-6 text-left border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-default"
      style={{
        background: isDark
          ? "rgba(15, 10, 5, 0.5)"
          : "rgba(255, 247, 237, 0.6)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderColor: isDark
          ? "rgba(249, 115, 22, 0.15)"
          : "rgba(234, 88, 12, 0.2)",
        boxShadow: isDark
          ? "0 2px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)"
          : "0 2px 20px rgba(234,88,12,0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
      }}
    >
      {/* Subtle top highlight line */}
      <div
        className="absolute top-0 left-6 right-6 h-px rounded-full"
        style={{
          background: isDark
            ? "linear-gradient(90deg, transparent, rgba(249,115,22,0.4), transparent)"
            : "linear-gradient(90deg, transparent, rgba(234,88,12,0.3), transparent)",
        }}
      />

      <div className="space-y-4">
        <div
          className="p-3 w-fit rounded-xl ring-1 ring-orange-500/20 group-hover:scale-110 transition-transform duration-300"
          style={{
            background: isDark ? "rgba(249,115,22,0.1)" : "rgba(234,88,12,0.08)",
          }}
        >
          {icon}
        </div>
        <h3
          className="text-xl font-semibold"
          style={{ color: isDark ? "#f8fafc" : "#0f172a" }}
        >
          {title}
        </h3>
        <p
          className="leading-relaxed text-sm"
          style={{ color: isDark ? "rgba(156,163,175,0.9)" : "rgba(71,85,105,0.9)" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
