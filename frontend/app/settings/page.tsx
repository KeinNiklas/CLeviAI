"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/lib/LanguageContext";
import { ChevronLeft, Globe, Moon, Cpu, Save, Loader2, Key, Zap, Sun, Laptop } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function SettingsPage() {
    const { language, setLanguage, t } = useLanguage();
    const { theme, setTheme } = useTheme();
    const [groqKey, setGroqKey] = useState("");
    const [geminiKey, setGeminiKey] = useState("");
    const [preferredModel, setPreferredModel] = useState("gemini");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [initialConfig, setInitialConfig] = useState({
        groqKey: "",
        geminiKey: "",
        preferredModel: "gemini"
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch("http://localhost:8000/settings/config");
                if (res.ok) {
                    const data = await res.json();
                    const config = {
                        groqKey: data.groq_key || "",
                        geminiKey: data.google_key || "",
                        preferredModel: data.preferred_model || "gemini"
                    };
                    setGroqKey(config.groqKey);
                    setGeminiKey(config.geminiKey);
                    setPreferredModel(config.preferredModel);
                    setInitialConfig(config);
                }
            } catch (e) {
                console.error("Failed to load settings", e);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const hasChanges =
        groqKey !== initialConfig.groqKey ||
        geminiKey !== initialConfig.geminiKey ||
        preferredModel !== initialConfig.preferredModel;

    const handleSaveKeys = async () => {
        setSaving(true);
        try {
            const response = await fetch("http://localhost:8000/settings/keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    groq_api_key: groqKey,
                    google_api_key: geminiKey,
                    preferred_model: preferredModel
                }),
            });
            if (response.ok) {
                // Update initial config to current values to reset "dirty" state
                setInitialConfig({
                    groqKey,
                    geminiKey,
                    preferredModel
                });
            } else {
                alert("Failed to save settings.");
            }
        } catch (error) {
            console.error(error);
            alert("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

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

                {/* AI Settings */}
                <section className="space-y-4">
                    <h2 className="text-lg font-medium text-muted-foreground uppercase tracking-wider text-sm flex items-center">
                        <Cpu className="w-4 h-4 mr-2" />
                        {t.settings.ai_config}
                    </h2>
                    <Card className="p-6 space-y-6">
                        <div className="space-y-4">
                            {/* Model Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center">
                                    <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                                    {t.settings.pref_model}
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setPreferredModel("gemini")}
                                        className={`px-4 py-3 rounded-lg border text-left transition-all ${preferredModel === "gemini"
                                                ? "bg-blue-500/10 border-blue-500 ring-1 ring-blue-500"
                                                : "bg-background border-white/10 hover:border-white/20"
                                            }`}
                                    >
                                        <div className="font-semibold text-sm mb-1">{t.settings.gemini}</div>
                                        <div className="text-xs text-muted-foreground">{t.settings.gemini_desc}</div>
                                    </button>
                                    <button
                                        onClick={() => setPreferredModel("groq")}
                                        className={`px-4 py-3 rounded-lg border text-left transition-all ${preferredModel === "groq"
                                                ? "bg-orange-500/10 border-orange-500 ring-1 ring-orange-500"
                                                : "bg-background border-white/10 hover:border-white/20"
                                            }`}
                                    >
                                        <div className="font-semibold text-sm mb-1">{t.settings.groq}</div>
                                        <div className="text-xs text-muted-foreground">{t.settings.groq_desc}</div>
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-white/5 my-4" />

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center">
                                    <Key className="w-4 h-4 mr-2 text-primary" />
                                    {t.settings.groq_key}
                                </label>
                                <input
                                    type="text"
                                    value={groqKey}
                                    onChange={(e) => setGroqKey(e.target.value)}
                                    placeholder="gsk_..."
                                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center">
                                    <Key className="w-4 h-4 mr-2 text-blue-400" />
                                    {t.settings.gemini_key}
                                </label>
                                <input
                                    type="text"
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    placeholder="AIza..."
                                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-white/5">
                            <Button
                                onClick={handleSaveKeys}
                                disabled={saving || !hasChanges}
                                className="bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        {t.settings.saving}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        {t.settings.save}
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                </section>
            </div>
        </div>
    );
}
