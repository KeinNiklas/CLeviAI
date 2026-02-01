
"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { Star, Check, Lock, RotateCw, BookOpen, ThumbsUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FlashcardViewer } from "./FlashcardViewer";

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
    status?: string; // "OPEN", "MASTERED", "STRUGGLING"
}

interface DaySchedule {
    date: string;
    topics: Topic[];
    total_hours: number;
}

interface StudyPlan {
    id: string;
    schedule: DaySchedule[];
}

interface GamifiedJourneyMapProps {
    plan: StudyPlan;
}

export function GamifiedJourneyMap({ plan }: GamifiedJourneyMapProps) {
    const [selectedTopic, setSelectedTopic] = React.useState<Topic | null>(null);
    const [localPlan, setLocalPlan] = React.useState<StudyPlan>(plan);

    // Sync local plan if prop changes (e.g. reload)
    React.useEffect(() => {
        setLocalPlan(plan);
    }, [plan]);

    const updateStatus = async (topic: Topic, newStatus: string) => {
        // Optimistic UI Update
        const updatedSchedule = localPlan.schedule.map(day => ({
            ...day,
            topics: day.topics.map(t =>
                t.id === topic.id ? { ...t, status: newStatus } : t
            )
        }));
        setLocalPlan({ ...localPlan, schedule: updatedSchedule });

        // Backend Call
        try {
            await fetch(`http://localhost:8000/plans/${plan.id}/topics/${topic.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto py-8">
            <h2 className="text-3xl font-bold text-center mb-12">Your Learning Path</h2>

            <div className="relative flex flex-col items-center space-y-16">

                {localPlan.schedule.map((day, dayIndex) => (
                    <div key={dayIndex} className="w-full flex flex-col items-center relative">
                        {/* Day Header */}
                        <div className="z-10 bg-secondary/80 backdrop-blur border border-border px-6 py-2 rounded-full mb-8 shadow-sm">
                            <h3 className="font-bold text-lg">
                                {format(parseISO(day.date), "MMMM do")}
                            </h3>
                            <p className="text-xs text-center text-muted-foreground uppercase tracking-widest">
                                {day.total_hours}h Goal
                            </p>
                        </div>

                        {/* Topics Path */}
                        <div className="grid grid-cols-1 gap-12 w-full max-w-md relative">
                            {/* Connecting Line Segments */}
                            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 -translate-x-1/2 -z-10 rounded-full" />

                            {day.topics.map((topic, topicIndex) => {
                                const isLeft = topicIndex % 2 === 0;
                                const isMastered = topic.status === "MASTERED";
                                const isStruggling = topic.status === "STRUGGLING";

                                return (
                                    <div
                                        key={topic.id}
                                        className={`flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'} justify-center relative`}
                                    >
                                        {/* Node */}
                                        <div className="relative group cursor-pointer" onClick={() => setSelectedTopic(topic)}>
                                            {/* Node Circle */}
                                            <div className={`
                                                w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-xl transition-all transform hover:scale-110 active:scale-95
                                                ${isMastered ? 'bg-yellow-500/10 border-yellow-500' : isStruggling ? 'bg-destructive/10 border-destructive' : 'bg-card border-border hover:border-primary'}
                                            `}>
                                                {isMastered ? (
                                                    <Star className="w-10 h-10 text-yellow-500 fill-current" />
                                                ) : isStruggling ? (
                                                    <AlertCircle className="w-10 h-10 text-destructive" />
                                                ) : (
                                                    <BookOpen className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                                )}
                                            </div>

                                            {/* Tooltip / Label */}
                                            <div className={`
                                                absolute top-1/2 -translate-y-1/2 ${isLeft ? 'left-28 text-left' : 'right-28 text-right'} 
                                                w-56 z-20 pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity
                                            `}>
                                                <div className="bg-popover border border-border p-4 rounded-xl shadow-2xl relative">
                                                    <h4 className="font-bold text-sm leading-tight mb-2">{topic.title}</h4>

                                                    <div className="flex flex-col gap-2 mt-3 pointer-events-auto">
                                                        <Button
                                                            size="sm"
                                                            variant={isMastered ? "default" : "outline"}
                                                            className={isMastered ? "bg-yellow-500 hover:bg-yellow-600 text-black" : ""}
                                                            onClick={(e) => { e.stopPropagation(); updateStatus(topic, "MASTERED"); }}
                                                        >
                                                            <ThumbsUp className="w-3 h-3 mr-1" />
                                                            I Know This
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant={isStruggling ? "destructive" : "outline"}
                                                            onClick={(e) => { e.stopPropagation(); updateStatus(topic, "STRUGGLING"); }}
                                                        >
                                                            <AlertCircle className="w-3 h-3 mr-1" />
                                                            Need Practice
                                                        </Button>

                                                        {topic.flashcards && topic.flashcards.length > 0 && (
                                                            <div className="mt-1 pt-2 border-t border-border flex justify-center text-xs text-primary font-medium">
                                                                <RotateCw className="w-3 h-3 mr-1" />
                                                                Practice available
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Celebration at end */}
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-yellow-500/20 border-4 border-yellow-500 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                        🏆
                    </div>
                </div>

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
