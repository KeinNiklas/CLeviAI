"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/lib/LanguageContext";
import { ChevronLeft, Globe, Moon, Sun, Laptop } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function SettingsPage() {
    const { language, setLanguage, t } = useLanguage();
    const { theme, setTheme } = useTheme();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header */}
            <div className="border-b border-white/5 bg-card/30 backdrop-blur-xl p-4 sticky top-0 z-10">
                <div className="container mx-auto max-w-2xl flex items-center">
                    <Link href="/" className="mr-4 text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-xl font-semibold">{t.settings.title}</h1>
                </div>
            </div>

            <div className="container mx-auto max-w-2xl p-6 space-y-6">
                {/* General Settings */}
                <section className="space-y-4">
                    <h2 className="text-lg font-medium text-muted-foreground uppercase tracking-wider text-sm">
                        {t.settings.general}
                    </h2>
                    <Card className="p-0 overflow-hidden">
                        <div className="p-6 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Globe className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-medium">{t.settings.language}</h3>
                                    <p className="text-sm text-muted-foreground">{t.settings.language_desc}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2 bg-white/5 p-1 rounded-lg">
                                <button
                                    onClick={() => setLanguage("en")}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${language === "en"
                                        ? "bg-primary text-white shadow-md"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => setLanguage("de")}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${language === "de"
                                        ? "bg-primary text-white shadow-md"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    Deutsch
                                </button>
                            </div>
                        </div>

                        {/* Theme Settings */}
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <Moon className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-medium">{t.settings.theme}</h3>
                                    <p className="text-sm text-muted-foreground">{t.settings.theme_desc}</p>
                                </div>
                            </div>

                            <div className="flex space-x-2 bg-white/5 p-1 rounded-lg">
                                <button
                                    onClick={() => setTheme("light")}
                                    className={`p-2 rounded-md transition-all ${theme === "light"
                                        ? "bg-primary text-white shadow-md"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    title={t.settings.light}
                                >
                                    <Sun className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setTheme("dark")}
                                    className={`p-2 rounded-md transition-all ${theme === "dark"
                                        ? "bg-primary text-white shadow-md"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    title={t.settings.dark}
                                >
                                    <Moon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setTheme("system")}
                                    className={`p-2 rounded-md transition-all ${theme === "system"
                                        ? "bg-primary text-white shadow-md"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    title={t.settings.system}
                                >
                                    <Laptop className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </Card>
                </section>
            </div>
        </div>
    );
}
