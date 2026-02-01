
"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";

import { de, enUS as en } from "date-fns/locale";
import { Star, Check, Lock, RotateCw, BookOpen, ThumbsUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GameShell, Challenge } from "../game/GameShell";
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
    games?: Challenge[]; // Add games support
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

// Helper to convert flashcards/topics to challenges if no dedicated game data exists
const generateChallenges = (topic: Topic): Challenge[] => {
    const challenges: Challenge[] = [];

    // 1. Create a Match Game from first 4 flashcards
    if (topic.flashcards && topic.flashcards.length >= 4) {
        const set = topic.flashcards.slice(0, 4);
        const pairString = set.map(f => `${f.question}:${f.answer}`).join(";");
        challenges.push({
            type: "MATCH",
            question: "Matches! Connect the terms.",
            correct_answer: "",
            pair: pairString
        });
    }

    // 2. Create Quiz questions
    topic.flashcards?.forEach(f => {
        // Simple distractors: picks random other answers from the same deck
        const otherAnswers = topic.flashcards
            ?.filter(x => x.answer !== f.answer)
            .map(x => x.answer)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        if (otherAnswers && otherAnswers.length === 3) {
            challenges.push({
                type: "QUIZ",
                question: f.question,
                correct_answer: f.answer,
                distractors: otherAnswers
            });
        }
    });

    // Shuffle challenges
    return challenges.sort(() => Math.random() - 0.5);
};

export function GamifiedJourneyMap({ plan }: GamifiedJourneyMapProps) {
    const { t, language } = useLanguage();
    const [activeGame, setActiveGame] = React.useState<{ topic: Topic, challenges: Challenge[] } | null>(null);
    const [localPlan, setLocalPlan] = React.useState<StudyPlan>(plan);

    // Sync local plan if prop changes (e.g. reload)
    React.useEffect(() => {
        setLocalPlan(plan);
    }, [plan]);

    const updateStatus = async (topicId: string, newStatus: string) => {
        // Optimistic UI Update
        const updatedSchedule = localPlan.schedule.map(day => ({
            ...day,
            topics: day.topics.map(t =>
                t.id === topicId ? { ...t, status: newStatus } : t
            )
        }));
        setLocalPlan({ ...localPlan, schedule: updatedSchedule });

        // Backend Call
        try {
            await fetch(`http://localhost:8000/plans/${plan.id}/topics/${topicId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleTopicClick = (topic: Topic) => {
        // Prefer explicit games, fallback to generated from flashcards
        let challenges: Challenge[] = topic.games as any || [];
        if (challenges.length === 0) {
            challenges = generateChallenges(topic);
        }

        if (challenges.length === 0) {
            alert("No content available for this topic yet.");
            return;
        }

        setActiveGame({ topic, challenges });
    };

    const handleGameComplete = (success: boolean) => {
        if (success && activeGame) {
            updateStatus(activeGame.topic.id, "MASTERED");
        }
        setActiveGame(null);
    };

    return (
        <div className="w-full max-w-3xl mx-auto py-8">
            <h2 className="text-3xl font-bold text-center mb-12">{t.dashboard.your_path}</h2>

            {/* Path Visualizer */}
            <div className="relative flex flex-col items-center space-y-16">
                {localPlan.schedule.map((day, dayIndex) => (
                    <div key={dayIndex} className="w-full flex flex-col items-center relative">
                        {/* Day Header */}
                        <div className="z-10 bg-secondary/80 backdrop-blur border border-border px-6 py-2 rounded-full mb-8 shadow-sm">
                            <h3 className="font-bold text-lg">
                                {format(parseISO(day.date), "do MMMM", { locale: language === 'de' ? de : en })}
                            </h3>
                            <p className="text-xs text-center text-muted-foreground uppercase tracking-widest">
                                {day.total_hours}h {t.dashboard.goal}
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
                                        <div className="relative group cursor-pointer" onClick={() => handleTopicClick(topic)}>
                                            {/* Node Circle */}
                                            <div className={`
                                                w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-xl transition-all transform hover:scale-110 active:scale-95 z-20 bg-background
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

                                            {/* Label (Always visible now for clarity, or on hover) */}
                                            <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 text-center`}>
                                                <span className="text-sm font-medium text-muted-foreground bg-background/50 px-2 py-1 rounded-md backdrop-blur-sm">
                                                    {topic.title}
                                                </span>
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

            {/* Game Overlay */}
            {activeGame && (
                <GameShell
                    title={activeGame.topic.title}
                    challenges={activeGame.challenges}
                    onComplete={handleGameComplete}
                    onClose={() => setActiveGame(null)}
                />
            )}
        </div>
    );
}
