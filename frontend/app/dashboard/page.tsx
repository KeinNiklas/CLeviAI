
"use client";

import * as React from "react";
import { format } from "date-fns";
import { enUS, de } from "date-fns/locale";
import { Calendar, ChevronRight, LayoutDashboard, Loader2, BookOpen, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GamifiedJourneyMap } from "@/components/dashboard/GamifiedJourneyMap";
import { useLanguage } from "@/lib/LanguageContext";

interface StudyPlan {
    id: string;
    name: string;
    exam_date: string;
    parallel_courses: number;
    schedule: any[];
    created_at: string;
}

export default function DashboardPage() {
    const { t, language } = useLanguage();
    const currentLocale = language === "de" ? de : enUS;
    const [plans, setPlans] = React.useState<StudyPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = React.useState<StudyPlan | null>(null);
    const [loading, setLoading] = React.useState(true);

    // Rename state
    const [isRenaming, setIsRenaming] = React.useState(false);
    const [newName, setNewName] = React.useState("");

    React.useEffect(() => {
        fetchPlans();
    }, []);

    React.useEffect(() => {
        if (selectedPlan) {
            setNewName(selectedPlan.name || "Exam Preparation");
        }
    }, [selectedPlan]);

    const fetchPlans = async () => {
        try {
            const response = await fetch("http://localhost:8000/plans");
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

    const handleRename = async () => {
        if (!selectedPlan) return;
        try {
            const response = await fetch(`http://localhost:8000/plans/${selectedPlan.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName })
            });

            if (response.ok) {
                const updatedPlan = await response.json();
                setSelectedPlan(updatedPlan);
                // Update list as well
                setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
                setIsRenaming(false);
            }
        } catch (error) {
            console.error("Failed to rename plan", error);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-4">
            <div className="container mx-auto max-w-6xl space-y-8">
                <header className="flex items-center space-x-4 mb-8 border-b border-border pb-6 min-h-[80px]">
                    <LayoutDashboard className="w-8 h-8 text-primary shrink-0" />

                    {selectedPlan ? (
                        <div className="flex items-center space-x-4">
                            {isRenaming ? (
                                <div className="flex items-center space-x-2 animate-in fade-in zoom-in-95">
                                    <input
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="text-3xl font-bold bg-background border rounded px-2 py-1 max-w-[300px] md:max-w-[500px]"
                                        autoFocus
                                    />
                                    <Button size="icon" variant="ghost" onClick={handleRename} title={t.dashboard.save}>
                                        <Check className="w-5 h-5 text-green-500" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => setIsRenaming(false)} title={t.dashboard.cancel}>
                                        <X className="w-5 h-5 text-destructive" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2 group">
                                    <h1 className="text-3xl font-bold">{selectedPlan.name || "Exam Preparation"}</h1>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="transition-opacity"
                                        onClick={() => {
                                            setNewName(selectedPlan.name || "Exam Preparation");
                                            setIsRenaming(true);
                                        }}
                                        title={t.dashboard.rename_tooltip}
                                    >
                                        <Pencil className="rename-icon w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <h1 className="text-3xl font-bold">Your Learning Profile</h1>
                    )}
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : selectedPlan ? (
                    <div className="animate-fade-in-up">
                        <Button
                            variant="ghost"
                            onClick={() => setSelectedPlan(null)}
                            className="mb-4"
                        >
                            ← Back to Overview
                        </Button>

                        <GamifiedJourneyMap plan={selectedPlan} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {plans.length === 0 ? (
                            <div className="col-span-full text-center py-20 text-muted-foreground">
                                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No learning journeys found yet.</p>
                                <a href="/plan" className="text-primary hover:underline mt-2 block">Create your first plan</a>
                            </div>
                        ) : (
                            plans.map((plan) => (
                                <Card
                                    key={plan.id}
                                    className="p-6 cursor-pointer hover:bg-secondary/50 transition-colors group border-border"
                                    onClick={() => setSelectedPlan(plan)}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Calendar className="w-6 h-6 text-primary" />
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>

                                    <h3 className="font-semibold text-lg mb-2">{plan.name || "Exam Preparation"}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Target: {format(new Date(plan.exam_date), "d. MMM yyyy", { locale: currentLocale })}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                                        <span>{plan.parallel_courses} Parallel Courses</span>
                                        <span>Created {format(new Date(plan.created_at), "d. MMM", { locale: currentLocale })}</span>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
