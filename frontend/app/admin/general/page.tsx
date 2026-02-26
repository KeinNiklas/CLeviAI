'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Save, Loader2, Key, Zap, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';

export default function AdminGeneralPage() {
    const { token } = useAuth();
    const { t } = useLanguage();

    // State for form values
    const [groqKey, setGroqKey] = useState('');
    const [geminiKey, setGeminiKey] = useState(''); // Maps to google_key
    const [preferredModel, setPreferredModel] = useState('gemini');

    // State for UI interaction
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState('');

    // Initial config for dirty checking (optional, but good UX)
    const [initialConfig, setInitialConfig] = useState({
        groqKey: "",
        geminiKey: "",
        preferredModel: "gemini"
    });

    // Load initial configuration
    useEffect(() => {
        const fetchConfig = async () => {
            if (!token) return;
            try {
                const res = await fetch('/api/settings/config', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const config = {
                        groqKey: data.groq_key || '',
                        geminiKey: data.google_key || '',
                        preferredModel: data.preferred_model || 'gemini'
                    };
                    setGroqKey(config.groqKey);
                    setGeminiKey(config.geminiKey);
                    setPreferredModel(config.preferredModel);
                    setInitialConfig(config);
                }
            } catch (err) {
                console.error("Failed to load config", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfig();
    }, [token]);

    const hasChanges =
        groqKey !== initialConfig.groqKey ||
        geminiKey !== initialConfig.geminiKey ||
        preferredModel !== initialConfig.preferredModel;

    const handleSave = async () => {
        if (!token) return;
        setIsSaving(true);
        setStatusMessage('');

        try {
            const res = await fetch('/api/settings/keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    groq_api_key: groqKey,
                    google_api_key: geminiKey,
                    preferred_model: preferredModel
                })
            });

            if (res.ok) {
                setStatusMessage(t.admin.config_success);
                setInitialConfig({
                    groqKey,
                    geminiKey,
                    preferredModel
                });
                setTimeout(() => setStatusMessage(''), 3000);
            } else {
                setStatusMessage(t.admin.config_fail);
            }
        } catch (error) {
            setStatusMessage(t.admin.config_error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{t.admin.general_title}</h1>
            </div>

            {/* AI Settings Section - Adapted from SettingsPage */}
            <section className="space-y-4">
                <h2 className="text-lg font-medium text-muted-foreground uppercase tracking-wider text-sm flex items-center">
                    <Cpu className="w-4 h-4 mr-2" />
                    {t.settings.ai_config}
                </h2>

                <Card className="p-6 space-y-6 border-border/50 bg-card/30 backdrop-blur-xl">
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

                        {/* Groq Key Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center">
                                <Key className="w-4 h-4 mr-2 text-primary" />
                                {t.settings.groq_key}
                            </label>
                            <input
                                type="text" // Kept as text per settings page (usually password is better, but matching request)
                                value={groqKey}
                                onChange={(e) => setGroqKey(e.target.value)}
                                placeholder="gsk_..."
                                className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
                            />
                        </div>

                        {/* Gemini Key Input */}
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

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <p className={`text-sm ${statusMessage.includes('Success') ? 'text-green-500' : 'text-destructive'}`}>
                            {statusMessage}
                        </p>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !hasChanges}
                            className="bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
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
        </motion.div>
    );
}
