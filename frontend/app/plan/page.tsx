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
    const [parallelCourses, setParallelCourses] = React.useState(0);
    const [plan, setPlan] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(false);

    const handleUploadComplete = (data: Topic[]) => {
        setTopics(data);
        setStep("SETTINGS");
    };

    const handleGeneratePlan = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8000/create-plan", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    topics,
                    exam_date: examDate,
                    parallel_courses: parallelCourses,
                }),
            });

            if (!response.ok) throw new Error("Failed to generate plan");

            const planData = await response.json();
            setPlan(planData);
            setStep("RESULT");
        } catch (error) {
            console.error(error);
            alert("Failed to generate plan. Please try again.");
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
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">{t.plan.label_date}</label>
                                <input
                                    type="date"
                                    className="w-full p-2 rounded-md bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
                                    value={examDate}
                                    onChange={(e) => setExamDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium">{t.plan.label_parallel}</label>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max="5"
                                        step="1"
                                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                                        value={parallelCourses}
                                        onChange={(e) => setParallelCourses(parseInt(e.target.value))}
                                    />
                                    <span className="font-bold text-xl w-8 text-center">{parallelCourses}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t.plan.note_parallel}
                                </p>
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
                                disabled={!examDate || loading}
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
                        <div className="flex justify-center mt-8">
                            <Button variant="ghost" onClick={() => setStep("SETTINGS")}>
                                <Settings className="w-4 h-4 mr-2" />
                                {t.plan.btn_adjust}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
