"use client";

import { useState } from "react";
import { Challenge } from "./GameShell";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface QuizChallengeProps {
    data: Challenge;
    onSuccess: () => void;
    onFailure: () => void;
}

export function QuizChallenge({ data, onSuccess, onFailure }: QuizChallengeProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Combine correct + distractors and shuffle
    // Using simple deterministic shuffle or just memoize for now
    const [options] = useState(() => {
        const all = [data.correct_answer, ...(data.distractors || [])];
        return all.sort(() => Math.random() - 0.5);
    });

    const handleSelect = (option: string) => {
        if (hasSubmitted) return;
        setSelectedAnswer(option);
    };

    const handleCheck = () => {
        if (!selectedAnswer || hasSubmitted) return;

        setHasSubmitted(true);
        const isCorrect = selectedAnswer === data.correct_answer;

        if (isCorrect) {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.8 },
                colors: ['#22c55e', '#ffffff'] // Green/White
            });
            setTimeout(onSuccess, 1500);
        } else {
            // Shake effect or sound
            onFailure();
            // Don't auto advance on failure, let them see the correct one
            setTimeout(onSuccess, 2000); // Advance anyway after showing error for flow
        }
    };

    const variant = hasSubmitted ? "default" : "outline";

    return (
        <div className="flex flex-col space-y-8 w-full">
            <h2 className="text-2xl font-bold text-center">{data.question}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {options.map((option, idx) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === data.correct_answer;

                    let statusClass = "hover:bg-secondary/50 border-2 border-border";
                    if (isSelected && !hasSubmitted) statusClass = "border-orange-500 bg-orange-500/10 text-orange-500";

                    if (hasSubmitted) {
                        if (isCorrect) statusClass = "border-green-500 bg-green-500/20 text-green-500";
                        else if (isSelected && !isCorrect) statusClass = "border-red-500 bg-red-500/20 text-red-500";
                        else statusClass = "opacity-50 border-transparent";
                    }

                    return (
                        <div
                            key={idx}
                            onClick={() => handleSelect(option)}
                            className={cn(
                                "cursor-pointer p-6 rounded-2xl text-lg font-medium transition-all duration-200 flex items-center justify-between min-h-[100px] break-words",
                                statusClass
                            )}
                        >
                            <span className="flex-1 mr-4 text-sm md:text-base leading-snug">{option}</span>
                            {hasSubmitted && isCorrect && <CheckCircle className="text-green-500" />}
                            {hasSubmitted && isSelected && !isCorrect && <XCircle className="text-red-500" />}
                        </div>
                    );
                })}
            </div>

            <Button
                size="lg"
                disabled={!selectedAnswer || hasSubmitted}
                className="w-full mt-8 text-xl py-8"
                onClick={handleCheck}
            >
                Check Answer
            </Button>
        </div>
    );
}
