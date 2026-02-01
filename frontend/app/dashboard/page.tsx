
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar, ChevronRight, LayoutDashboard, Loader2, BookOpen, Trash2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GamifiedJourneyMap } from "@/components/dashboard/GamifiedJourneyMap";

interface StudyPlan {
    id: string;
    exam_date: string;
    parallel_courses: number;
    schedule: any[];
    created_at: string;
}

export default function DashboardPage() {
    const [plans, setPlans] = React.useState<StudyPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = React.useState<StudyPlan | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchPlans();
    }, []);

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

    const handleDelete = async (e: React.MouseEvent, planId: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this journey?")) return;

        try {
            const response = await fetch(`http://localhost:8000/plans/${planId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setPlans(plans.filter(p => p.id !== planId));
                // If the deleted plan was selected, deselect it
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
                <header className="flex items-center space-x-4 mb-8 border-b border-border pb-6">
                    <LayoutDashboard className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold">Your Learning Profile</h1>
                </header>

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
                                fetchPlans(); // Refresh to get latest status updates
                            }}
                            className="mb-4"
                        >
                            ← Back to Overview
                        </Button>
                        <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center text-muted-foreground">
                            Journey to Excellence
                        </h2>
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

                                            <div className="flex items-center space-x-2">
                                                {progress === 100 && <Trophy className="w-5 h-5 text-yellow-500 animate-pulse" />}
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

                                        <h3 className="font-semibold text-lg mb-2 relative z-10">Exam Preparation</h3>
                                        <p className="text-sm text-muted-foreground mb-4 relative z-10">
                                            Target: {format(new Date(plan.exam_date), "MMM d, yyyy")}
                                        </p>

                                        <div className="w-full bg-secondary/50 h-2 rounded-full mb-4 overflow-hidden relative z-10">
                                            <div
                                                className="bg-primary h-full transition-all duration-1000 ease-out"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-right text-muted-foreground mb-4 relative z-10">{progress}% Mastery</p>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50 relative z-10">
                                            <span>{plan.parallel_courses} Parallel Courses</span>
                                            <span>Created {format(new Date(plan.created_at), "MMM d")}</span>
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
