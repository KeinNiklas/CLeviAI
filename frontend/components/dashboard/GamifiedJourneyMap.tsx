
"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { Star, Check, Lock, RotateCw, BookOpen } from "lucide-react";
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

    // Flatten logic for simple path rendering
    // But we want to group by Days headers

    return (
        <div className="w-full max-w-3xl mx-auto py-8">
            <h2 className="text-3xl font-bold text-center mb-12">Your Learning Path</h2>

            <div className="relative flex flex-col items-center space-y-16">

                {plan.schedule.map((day, dayIndex) => (
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
                            {/* Connecting Line Segments (Simplified visual hack) */}
                            {/* Ideally SVG, but here using a central border line behind everything */}
                            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 -translate-x-1/2 -z-10 rounded-full" />

                            {day.topics.map((topic, topicIndex) => {
                                // Alternating Layout
                                const isLeft = topicIndex % 2 === 0;
                                const isCompleted = dayIndex < 0; // Logic for future: check if date is past
                                const isActive = dayIndex === 0 && topicIndex === 0; // Logic: simplified active state

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
                                                ${isActive ? 'bg-primary border-primary-foreground animate-bounce-subtle' : 'bg-card border-border hover:border-primary'}
                                            `}>
                                                {isActive ? (
                                                    <Star className="w-10 h-10 text-primary-foreground fill-current" />
                                                ) : (
                                                    <BookOpen className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                                )}
                                            </div>

                                            {/* Tooltip / Label */}
                                            <div className={`
                                                absolute top-1/2 -translate-y-1/2 ${isLeft ? 'left-28 text-left' : 'right-28 text-right'} 
                                                w-48 z-10 pointer-events-none group-hover:pointer-events-auto
                                            `}>
                                                <div className="bg-popover border border-border p-3 rounded-lg shadow-lg opacity-80 md:opacity-100 transition-opacity">
                                                    <h4 className="font-bold text-sm leading-tight">{topic.title}</h4>
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{topic.description}</p>

                                                    {topic.flashcards && topic.flashcards.length > 0 && (
                                                        <div className="mt-2 flex items-center text-xs text-primary font-medium">
                                                            <RotateCw className="w-3 h-3 mr-1" />
                                                            Practice available
                                                        </div>
                                                    )}
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
                    <div className="mt-4 font-bold text-xl text-yellow-500">Exam Ready!</div>
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
