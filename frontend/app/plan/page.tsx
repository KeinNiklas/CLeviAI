"use client";

import * as React from "react";
import { format } from "date-fns";
import { ArrowRight, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FileUploader } from "@/components/upload/FileUploader";
import { StudyTimeline } from "@/components/dashboard/StudyTimeline";
import { useLanguage } from "@/lib/LanguageContext";

interface Topic {
    id: string;
    title: string;
    description: string;
    estimated_hours: number;
}

export default function CreatePlanPage() {
    const { t } = useLanguage();
    const [step, setStep] = React.useState<"UPLOAD" | "SETTINGS" | "RESULT">("UPLOAD");
    const [topics, setTopics] = React.useState<Topic[]>([]);
    const [examDate, setExamDate] = React.useState("");
    const [planTitle, setPlanTitle] = React.useState("My Learning Journey");
    const [dailyGoal, setDailyGoal] = React.useState(2.0);
    const [studyDays, setStudyDays] = React.useState<number[]>([0, 1, 2, 3, 4]); // Mon-Fri default
    const [parallelCourses, setParallelCourses] = React.useState(0); // Legacy/Unused now but kept for compatibility
    const [plan, setPlan] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(false);

    const handleUploadComplete = (data: Topic[]) => {
        setTopics(data);
        setStep("SETTINGS");
    };

    const handleGeneratePlan = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/create-plan", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    topics,
                    exam_date: examDate,
                    parallel_courses: parallelCourses,
                    title: planTitle,
                    daily_goal: dailyGoal,
                    study_days: studyDays
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to generate plan");
            }

            const planData = await response.json();
            setPlan(planData);
            setStep("RESULT");
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground py-20 px-4">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-4xl font-bold text-center mb-12">
                    {t.plan.title}
                </h1>

                {step === "UPLOAD" && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold mb-2">{t.plan.step1_title}</h2>
                            <p className="text-muted-foreground">{t.plan.step1_desc}</p>
                        </div>
                        <FileUploader onUploadComplete={handleUploadComplete} />
                    </div>
                )}

                {step === "SETTINGS" && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold mb-2">{t.plan.step2_title}</h2>
                            <p className="text-muted-foreground">{t.plan.step2_desc}</p>
                        </div>

                        <Card className="p-6 space-y-6 max-w-xl mx-auto bg-card border-border">
                            {/* Title Request */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">Journey Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 rounded-md bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="e.g. Finals Prep 2024"
                                    value={planTitle}
                                    onChange={(e) => setPlanTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium">{t.plan.label_date}</label>
                                <input
                                    type="date"
                                    className="w-full p-2 rounded-md bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
                                    value={examDate}
                                    onChange={(e) => setExamDate(e.target.value)}
                                />
                            </div>

                            {/* Daily Goal Slider */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">Daily Goal (Hours)</label>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="8"
                                        step="0.5"
                                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                                        value={dailyGoal}
                                        onChange={(e) => setDailyGoal(parseFloat(e.target.value))}
                                    />
                                    <span className="font-bold text-xl w-12 text-center">{dailyGoal}h</span>
                                </div>
                            </div>

                            {/* Study Days Toggles */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">Study Days</label>
                                <div className="flex justify-between gap-1">
                                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => {
                                        // Adjust index so 0=Mon, 6=Sun to match python weekday() usually? 
                                        // Actually Python: 0=Mon, 6=Sun.
                                        // But calendar usually displays Sun first.
                                        // Let's use simple Map: 0=Mon...6=Sun.
                                        // The array above is visual. Let's make it data-driven:
                                        const days = [
                                            { label: "M", val: 0 }, { label: "T", val: 1 }, { label: "W", val: 2 },
                                            { label: "T", val: 3 }, { label: "F", val: 4 }, { label: "S", val: 5 }, { label: "S", val: 6 }
                                        ];
                                        const dayInfo = days[i];
                                        // Wait, the map index i will suffice if we define array correctly.

                                        const isSelected = studyDays.includes(dayInfo.val);
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setStudyDays(prev =>
                                                        isSelected ? prev.filter(x => x !== dayInfo.val) : [...prev, dayInfo.val]
                                                    );
                                                }}
                                                className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${isSelected ? 'bg-primary text-primary-foreground shadow-lg scale-110' : 'bg-secondary text-muted-foreground'}`}
                                            >
                                                {dayInfo.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border">
                                <h3 className="font-semibold mb-4">{t.plan.topics_title} ({topics.length})</h3>
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {topics.map((topic) => (
                                        <div key={topic.id} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg text-sm">
                                            <span>{topic.title}</span>
                                            <span className="text-muted-foreground text-xs">{topic.estimated_hours}h</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleGeneratePlan}
                                disabled={!examDate || loading || studyDays.length === 0}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t.plan.btn_calculate}
                                    </>
                                ) : (
                                    <>
                                        {t.plan.btn_routine}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </Card>
                    </div>
                )}

                {step === "RESULT" && plan && (
                    <div className="animate-fade-in-up">
                        <StudyTimeline plan={plan} />
                        <div className="flex justify-center mt-8 space-x-4">
                            <Button variant="ghost" onClick={() => setStep("SETTINGS")}>
                                <Settings className="w-4 h-4 mr-2" />
                                {t.plan.btn_adjust}
                            </Button>
                            <Button onClick={() => window.location.href = "/dashboard"} className="shadow-lg">
                                Go to Dashboard
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
