"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { enUS, de } from "date-fns/locale";
import { Calendar, Clock, BookOpen, CheckCircle2, RotateCw, Pencil, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FlashcardViewer } from "./FlashcardViewer";
import { useLanguage } from "@/lib/LanguageContext";

interface Flashcard {
    question: string;
    answer: string;
}

interface Topic {
    id: string;
    title: string;
    description: string;
    estimated_hours: number;
    flashcards?: Flashcard[];
}

interface DaySchedule {
    date: string;
    topics: Topic[];
    total_hours: number;
}

interface StudyPlan {
    id: string;
    name: string;
    schedule: DaySchedule[];
}

interface StudyTimelineProps {
    plan: StudyPlan;
}

export function StudyTimeline({ plan: initialPlan }: StudyTimelineProps) {
    const { t, language } = useLanguage();
    const currentLocale = language === "de" ? de : enUS;
    const [plan, setPlan] = React.useState(initialPlan);
    const [selectedTopic, setSelectedTopic] = React.useState<Topic | null>(null);
    const [isRenaming, setIsRenaming] = React.useState(false);
    const [newName, setNewName] = React.useState(initialPlan.name || "My Study Plan");

    const handleRename = async () => {
        try {
            const response = await fetch(`http://localhost:8000/plans/${plan.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName })
            });

            if (response.ok) {
                const updatedPlan = await response.json();
                setPlan(updatedPlan);
                setIsRenaming(false);
            }
        } catch (error) {
            console.error("Failed to rename plan", error);
        }
    };

    return (
        <div className="space-y-8 w-full max-w-4xl mx-auto py-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {isRenaming ? (
                        <div className="flex items-center space-x-2 animate-in fade-in zoom-in-95">
                            <input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="text-3xl font-bold bg-background border rounded px-2 py-1 max-w-[300px]"
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
                            <h2 className="text-3xl font-bold">{plan.name || "My Study Plan"}</h2>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setIsRenaming(true)}
                                title={t.dashboard.rename_tooltip}
                            >
                                <Pencil className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        </div>
                    )}
                </div>
                <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Export to Calendar
                </Button>
            </div>

            <div className="relative border-l-2 border-border ml-4 md:ml-6 space-y-12 pb-12">
                {plan.schedule.map((day, index) => (
                    <div key={index} className="relative pl-8 md:pl-12 group">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-sm group-hover:scale-125 transition-transform" />

                        {/* Date Header */}
                        <div className="flex flex-col md:flex-row md:items-center mb-4 gap-2">
                            <span className="text-lg font-bold">
                                {format(parseISO(day.date), "EEEE, d. MMMM", { locale: currentLocale })}
                            </span>
                            <span className="text-sm font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md w-fit flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {day.total_hours} {t.dashboard.hours}
                            </span>
                        </div>

                        {/* Topics Grid */}
                        <div className="grid grid-cols-1 gap-4">
                            {day.topics.map((topic) => (
                                <Card key={topic.id} className="p-4 bg-card hover:bg-accent/5 transition-colors border-border">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="font-semibold text-lg flex items-center">
                                                <BookOpen className="w-4 h-4 mr-2 text-primary" />
                                                {topic.title}
                                            </h4>
                                            <p className="text-muted-foreground mt-1 text-sm">
                                                {topic.description}
                                            </p>
                                        </div>
                                        <div className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full whitespace-nowrap">
                                            {topic.estimated_hours}h
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end border-t border-border pt-3">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="text-primary hover:text-primary/80"
                                            onClick={() => setSelectedTopic(topic)}
                                        >
                                            <RotateCw className="w-4 h-4 mr-2" />
                                            Practice ({topic.flashcards?.length || 0})
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {selectedTopic && (
                <FlashcardViewer
                    topicTitle={selectedTopic.title}
                    flashcards={selectedTopic.flashcards || []}
                    onClose={() => setSelectedTopic(null)}
                />
            )}
        </div>
    );
}
