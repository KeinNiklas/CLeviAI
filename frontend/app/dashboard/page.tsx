"use client";

import * as React from "react";
import { format } from "date-fns";
import { de, enUS as en } from "date-fns/locale";
import { Calendar, ChevronRight, LayoutDashboard, Loader2, BookOpen, Trash2, Trophy, Pencil, Check, X, Lock, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GamifiedJourneyMap } from "@/components/dashboard/GamifiedJourneyMap";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import Link from 'next/link';

interface StudyPlan {
    id: string;
    title?: string;
    exam_date: string;
    parallel_courses: number;
    schedule: any[];
    created_at: string;
    daily_goal_hours?: number;
    study_days?: number[];
}



export default function DashboardPage() {
    const { t, language } = useLanguage();
    const { token, user } = useAuth(); // Get token and user
    const [plans, setPlans] = React.useState<StudyPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = React.useState<StudyPlan | null>(null);
    const [loading, setLoading] = React.useState(true);

    // Plan Limit Logic
    const PLAN_LIMIT = 3;
    const isStandard = user?.tier === 'standard' || !user?.tier; // Default to standard if missing
    const planCount = plans.length;
    const limitReached = isStandard && planCount >= PLAN_LIMIT;

    // Rename State
    const [editingPlanId, setEditingPlanId] = React.useState<string | null>(null);
    const [editTitle, setEditTitle] = React.useState("");

    React.useEffect(() => {
        fetchPlans();
    }, [token]);

    const fetchPlans = async () => {
        if (!token) return;
        try {
            const response = await fetch('/api/plans', {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setPlans(data);
            }
        } catch (error) {
            console.error("Failed to fetch plans:", error);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (e: React.MouseEvent, plan: StudyPlan) => {
        e.stopPropagation();
        setEditingPlanId(plan.id);
        setEditTitle(plan.title || "My Learning Journey");
    };

    const cancelEditing = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingPlanId(null);
        setEditTitle("");
    };

    const saveTitle = async (e: React.MouseEvent, planId: string) => {
        e.stopPropagation();
        if (!editTitle.trim()) return;

        try {
            const response = await fetch(`/api/plans/${planId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title: editTitle }),
            });

            if (response.ok) {
                setPlans(plans.map(p => p.id === planId ? { ...p, title: editTitle } : p));
                if (selectedPlan?.id === planId) {
                    setSelectedPlan({ ...selectedPlan, title: editTitle });
                }
                setEditingPlanId(null);
            }
        } catch (error) {
            console.error("Failed to rename plan:", error);
        }
    };

    const handleDelete = async (e: React.MouseEvent, planId: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this journey?")) return;

        try {
            const response = await fetch(`/api/plans/${planId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                setPlans(plans.filter(p => p.id !== planId));
                if (selectedPlan?.id === planId) {
                    setSelectedPlan(null);
                }
            }
        } catch (error) {
            console.error("Failed to delete plan:", error);
        }
    };

    const calculateProgress = (plan: StudyPlan) => {
        let total = 0;
        let mastered = 0;
        if (!plan.schedule) return 0;

        plan.schedule.forEach((day: any) => {
            if (day.topics) {
                day.topics.forEach((t: any) => {
                    total++;
                    if (t.status === "MASTERED") mastered++;
                });
            }
        });
        return total === 0 ? 0 : Math.round((mastered / total) * 100);
    };

    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-4">
            <div className="container mx-auto max-w-6xl space-y-8">
                <header className="flex items-center justify-between mb-8 border-b border-border pb-6">
                    <div className="flex items-center space-x-4">
                        <LayoutDashboard className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold">{t.dashboard.your_plans}</h1>
                    </div>
                </header>

                {/* Plan Limit Warning */}
                {limitReached && !loading && !selectedPlan && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-4 mb-6">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">{t.limits.warning_title}</h3>
                            <p className="text-sm text-yellow-700/80 dark:text-yellow-300/80 mt-1">
                                {t.limits.warning_desc.replace('{limit}', String(PLAN_LIMIT))}
                                {' '}
                                {t.limits.upgrade_prompt.split('{link}')[0]}
                                <Link href="/subscription" className="underline font-bold hover:text-yellow-900">
                                    {t.limits.upgrade_link}
                                </Link>
                                {t.limits.upgrade_prompt.split('{link}')[1]}
                            </p>
                        </div>
                    </div>
                )}

                {!selectedPlan && (
                    <div className="flex justify-end mb-4">
                        <Link href={limitReached ? "/subscription" : "/plan"}>
                            <Button
                                size="lg"
                                className={`shadow-lg shadow-primary/20 transition-all ${limitReached ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 border-0 text-white' : 'hover:shadow-primary/40 hover:scale-105'}`}
                                title={limitReached ? t.limits.btn_upgrade : t.dashboard.start}
                            >
                                {limitReached ? <Star className="w-5 h-5 mr-2 fill-white" /> : <Plus className="w-5 h-5 mr-2" />}
                                {limitReached ? t.limits.btn_upgrade : (t.dashboard.start || "Create New Plan")}
                            </Button>
                        </Link>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : selectedPlan ? (
                    <div className="animate-fade-in-up">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSelectedPlan(null);
                                fetchPlans();
                            }}
                            className="mb-4"
                        >
                            ← {t.dashboard.back_overview}
                        </Button>

                        {/* Title Section in Detail View */}
                        <div className="flex items-center justify-center mb-6 space-x-2">
                            {editingPlanId === selectedPlan.id ? (
                                <div className="flex items-center space-x-2 bg-card border border-border rounded-lg p-1 shadow-lg z-50">
                                    <input
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="text-2xl font-semibold bg-transparent border-none outline-none focus:ring-0 w-64 text-center"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:bg-green-500/10" onClick={(e) => saveTitle(e, selectedPlan.id)}>
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-500/10" onClick={cancelEditing}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="group flex items-center justify-center cursor-pointer" onClick={(e) => startEditing(e, selectedPlan)}>
                                    <h2 className="text-2xl font-semibold text-muted-foreground mr-2 group-hover:text-foreground transition-colors">
                                        {selectedPlan.title || "My Learning Journey"}
                                    </h2>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
                                        <Pencil className="w-4 h-4" />
                                    </span>
                                </div>
                            )}
                        </div>

                        <GamifiedJourneyMap plan={selectedPlan} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {plans.length === 0 ? (
                            <div className="col-span-full text-center py-20 text-muted-foreground">
                                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>{t.dashboard.no_plans}</p>
                                <a href="/plan" className="text-primary hover:underline mt-2 block">{t.dashboard.create_first}</a>
                            </div>
                        ) : (
                            plans.map((plan) => {
                                const progress = calculateProgress(plan);
                                return (
                                    <Card
                                        key={plan.id}
                                        className="p-6 cursor-pointer hover:bg-secondary/50 transition-colors group border-border relative overflow-hidden"
                                        onClick={() => setSelectedPlan(plan)}
                                    >
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Calendar className="w-6 h-6 text-primary" />
                                            </div>

                                            <div className="flex items-center space-x-1">
                                                {progress === 100 && <Trophy className="w-5 h-5 text-yellow-500 animate-pulse mr-2" />}

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                    onClick={(e) => startEditing(e, plan)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={(e) => handleDelete(e, plan.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {editingPlanId === plan.id ? (
                                            <div className="mb-2 flex items-center space-x-1 relative z-20 bg-background/80 backdrop-blur rounded p-1 border border-primary/20" onClick={e => e.stopPropagation()}>
                                                <input
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    className="font-semibold text-lg bg-transparent border-none outline-none w-full min-w-0"
                                                    autoFocus
                                                />
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-green-500 hover:bg-green-500/10 shrink-0" onClick={(e) => saveTitle(e, plan.id)}>
                                                    <Check className="w-3 h-3" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:bg-red-500/10 shrink-0" onClick={cancelEditing}>
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <h3 className="font-semibold text-lg mb-2 relative z-10 truncate pr-2" title={plan.title}>
                                                {plan.title || "My Learning Journey"}
                                            </h3>
                                        )}

                                        <p className="text-sm text-muted-foreground mb-4 relative z-10">
                                            {t.dashboard.target}: {format(new Date(plan.exam_date), "dd.MM.yyyy", { locale: language === 'de' ? de : en })}
                                        </p>

                                        <div className="w-full bg-secondary/50 h-2 rounded-full mb-4 overflow-hidden relative z-10">
                                            <div
                                                className="bg-primary h-full transition-all duration-1000 ease-out"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-right text-muted-foreground mb-4 relative z-10">{progress}% {t.dashboard.mastery}</p>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50 relative z-10">
                                            <span>
                                                {plan.schedule ? plan.schedule.length : 0} {t.dashboard.study_days}
                                            </span>
                                            <span>{t.dashboard.created_on} {format(new Date(plan.created_at), "dd.MM.yyyy", { locale: language === 'de' ? de : en })}</span>
                                        </div>

                                        {/* Subtle background progress fill */}
                                        <div
                                            className="absolute bottom-0 left-0 h-1 bg-primary/5 transition-all duration-1000"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </Card>
                                )
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
