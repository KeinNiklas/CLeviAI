"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { de, enUS as en } from "date-fns/locale";
import { Star, Check, Lock, RotateCw, BookOpen, ThumbsUp, AlertCircle, Headphones, Play, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GameShell, Challenge } from "../game/GameShell";
import { useLanguage } from "@/lib/LanguageContext";
import { API_URL } from '@/lib/api';
import { PodcastPlayer } from "./PodcastPlayer";

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
    const [selectedTopic, setSelectedTopic] = React.useState<Topic | null>(null); // For Menu Modal
    const [podcastTopic, setPodcastTopic] = React.useState<Topic | null>(null);   // For Player
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

        try {
            await fetch(`${API_URL}/plans/${plan.id}/topics/${topicId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleTopicClick = (topic: Topic) => {
        setSelectedTopic(topic);
    };

    const startChallenges = () => {
        if (!selectedTopic) return;

        // Prefer explicit games, fallback to generated
        let challenges: Challenge[] = selectedTopic.games as any || [];
        if (challenges.length === 0) {
            challenges = generateChallenges(selectedTopic);
        }

        if (challenges.length === 0) {
            alert("No content available for this topic yet.");
            return;
        }

        setActiveGame({ topic: selectedTopic, challenges });
        setSelectedTopic(null);
    };

    const startPodcast = () => {
        if (!selectedTopic) return;
        setPodcastTopic(selectedTopic);
        setSelectedTopic(null);
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

                                            {/* Label */}
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

            {/* Topic Selection Modal */}
            {selectedTopic && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <Card className="w-full max-w-sm p-6 bg-background border-border shadow-2xl relative">
                        <Button variant="ghost" className="absolute top-2 right-2" size="icon" onClick={() => setSelectedTopic(null)}>
                            <X className="w-4 h-4" />
                            <span className="sr-only">Close</span>
                        </Button>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold mb-2">{selectedTopic.title}</h3>
                            <p className="text-sm text-muted-foreground">{selectedTopic.description || "Ready to master this topic?"}</p>
                        </div>

                        <div className="space-y-3">
                            <Button className="w-full h-12 text-lg" onClick={startChallenges}>
                                <Play className="w-5 h-5 mr-2 fill-current" />
                                Start Questions
                            </Button>

                            <Button variant="outline" className="w-full h-12 text-lg border-primary/20 hover:bg-primary/5" onClick={startPodcast}>
                                <Headphones className="w-5 h-5 mr-2" />
                                Listen to Podcast
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Game Overlay */}
            {activeGame && (
                <GameShell
                    title={activeGame.topic.title}
                    challenges={activeGame.challenges}
                    onComplete={handleGameComplete}
                    onClose={() => setActiveGame(null)}
                />
            )}

            {/* Podcast Player Overlay */}
            {podcastTopic && (
                <PodcastPlayer
                    topicTitle={podcastTopic.title}
                    topicDescription={podcastTopic.description}
                    onClose={() => setPodcastTopic(null)}
                />
            )}
        </div>
    );
}
