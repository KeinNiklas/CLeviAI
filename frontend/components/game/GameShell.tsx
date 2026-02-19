"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import confetti from "canvas-confetti";
import { QuizChallenge } from "./QuizChallenge";
import { MatchChallenge } from "./MatchChallenge";

// Define the interface to match backend
export interface Challenge {
    type: "QUIZ" | "MATCH" | "TRUE_FALSE";
    question: string;
    correct_answer: string;
    distractors?: string[];
    pair?: string;
}

interface GameShellProps {
    title: string;
    challenges: Challenge[];
    onComplete: (success: boolean) => void;
    onClose: () => void;
}

export function GameShell({ title, challenges, onComplete, onClose }: GameShellProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lives, setLives] = useState(3);
    const [streak, setStreak] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    // Mock challenges if empty (for dev/demo purposes)
    const effectiveChallenges = challenges.length > 0 ? challenges : DUMMY_CHALLENGES;
    const currentChallenge = effectiveChallenges[currentIndex];

    const progress = ((currentIndex) / effectiveChallenges.length) * 100;

    const handleSuccess = () => {
        // Play sound?
        setStreak(s => s + 1);
        if (currentIndex < effectiveChallenges.length - 1) {
            setTimeout(() => setCurrentIndex(prev => prev + 1), 1000); // Auto advance after 1s
        } else {
            setIsCompleted(true);
            setTimeout(() => onComplete(true), 3000); // Finish after celebration
        }
    };

    const handleFailure = () => {
        setStreak(0);
        setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
                // Game Over logic
                // For now, maybe just reset or show restart?
                // keeping it simple: just show 0 hearts but let them finish for now
                return 0;
            }
            return newLives;
        });
    };

    // Trigger confetti when completed
    useEffect(() => {
        if (isCompleted) {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
        }
    }, [isCompleted]);

    if (isCompleted) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md">
                {/* Confetti handled by useEffect */}
                <Card className="p-8 text-center max-w-md border-orange-500/50 bg-secondary/30">
                    <h2 className="text-4xl font-bold mb-4 gradient-text">Lesson Complete!</h2>
                    <div className="text-6xl mb-6">🏆</div>
                    <p className="text-xl text-muted-foreground mb-8">You mastered {title}!</p>
                    <Button size="lg" className="w-full" onClick={() => onComplete(true)}>Continue</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
            {/* Header */}
            <div className="h-16 border-b border-border flex items-center px-4 justify-between max-w-4xl mx-auto w-full">
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-6 h-6 text-muted-foreground" />
                </Button>

                {/* Progress Bar */}
                <div className="flex-1 mx-8 h-4 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Hearts */}
                <div className="flex items-center text-red-500 font-bold text-lg">
                    <Heart className="w-6 h-6 fill-current mr-2" />
                    {lives}
                </div>
            </div>

            {/* Game Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full">
                <h3 className="text-2xl font-bold text-center mb-8">{title}</h3>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full"
                    >
                        {currentChallenge?.type === "QUIZ" && (
                            <QuizChallenge
                                data={currentChallenge}
                                onSuccess={handleSuccess}
                                onFailure={handleFailure}
                            />
                        )}
                        {currentChallenge?.type === "MATCH" && (
                            <MatchChallenge
                                data={currentChallenge}
                                onSuccess={handleSuccess}
                                onFailure={handleFailure}
                            />
                        )}
                        {/* Fallback for unimplamented types */}
                        {(currentChallenge?.type !== "QUIZ" && currentChallenge?.type !== "MATCH") && (
                            <div className="text-center p-8 border rounded-xl">
                                Unknown Challenge Type: {currentChallenge?.type}
                                <Button onClick={handleSuccess} className="mt-4 block mx-auto">Skip</Button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

const DUMMY_CHALLENGES: Challenge[] = [
    {
        type: "QUIZ",
        question: "What is the primary function of a database index?",
        correct_answer: "Speed up data retrieval",
        distractors: ["Store data backups", "Encrypt passwords", "Manage user sessions"]
    },
    {
        type: "MATCH",
        question: "Match the terms to their definitions",
        correct_answer: "", // Specific field pair used for Match
        // We might need to restructure Match data, but for now assuming 'pair' implies a single pair challenge or list of pairs?
        // Let's assume the Generator outputs multiple Matching challenges or 1 big one.
        // For simplicity, let's make the MatchChallenge handle a set of pairs.
        // But our model has 'pair' as optional string.
        // Let's treat MATCH type as "pick the correct pair" or simplified "connect pairs".
        // Actually, for Duolingo style "Match", it's usually 5 pairs on screen.
        // Our model needs to support that.
        // Quick fix: Use the 'distractors' + 'correct_answer' as pairs?
        // Or just hardcode dummy data for the UI first.
        pair: "Index:Speed; CPU:Processing"
    }
];
