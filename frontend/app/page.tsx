"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/lib/LanguageContext";
import { ArrowRight, BookOpen, Brain, Sparkles, Upload } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background text-foreground selection:bg-primary/20">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <main className="container mx-auto px-4 z-10 flex flex-col items-center text-center space-y-8 py-20">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-4 backdrop-blur-md animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-slate-300">
            {t.hero.badge}
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl animate-fade-in-up delay-100">
          {t.hero.title_start} <br />
          <span className="gradient-text">{t.hero.title_gradient}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed animate-fade-in-up delay-200">
          {t.hero.subtitle}
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4 animate-fade-in-up delay-300">
          <Link href="/course/demo">
            <Button size="lg" className="group">
              {t.hero.cta_start}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline" size="lg">
              Settings
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-5xl animate-fade-in-up delay-500">
          <FeatureCard
            icon={<Upload className="w-6 h-6 text-blue-400" />}
            title={t.features.upload_title}
            description={t.features.upload_desc}
          />
          <FeatureCard
            icon={<Brain className="w-6 h-6 text-purple-400" />}
            title={t.features.ai_title}
            description={t.features.ai_desc}
          />
          <FeatureCard
            icon={<BookOpen className="w-6 h-6 text-pink-400" />}
            title={t.features.course_title}
            description={t.features.course_desc}
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="hover:bg-white/5 transition-colors text-left group border-white/10">
      <div className="p-6 space-y-4">
        <div className="p-3 bg-white/5 w-fit rounded-xl group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/10">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </Card>
  );
}
