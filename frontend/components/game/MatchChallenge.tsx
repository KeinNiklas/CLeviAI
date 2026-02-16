"use client";

import { useState, useEffect } from "react";
import { Challenge } from "./GameShell";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface MatchChallengeProps {
    data: Challenge;
    onSuccess: () => void;
    onFailure: () => void;
}

interface Item {
    id: string;
    text: string;
    pairId: string;
    state: "default" | "selected" | "matched" | "wrong";
}

export function MatchChallenge({ data, onSuccess, onFailure }: MatchChallengeProps) {
    const [items, setItems] = useState<Item[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        // Parse "Term:Def;Term2:Def2"
        if (!data.pair) return;

        const pairs = data.pair.split(';').map(p => p.split(':'));
        const newItems: Item[] = [];

        pairs.forEach((p, idx) => {
            if (p.length < 2) return;
            const pid = `pair-${idx}`;
            newItems.push({ id: `t-${idx}`, text: p[0].trim(), pairId: pid, state: "default" });
            newItems.push({ id: `d-${idx}`, text: p[1].trim(), pairId: pid, state: "default" });
        });

        // Shuffle
        setItems(newItems.sort(() => Math.random() - 0.5));
    }, [data.pair]);

    const handleCardClick = (id: string) => {
        const item = items.find(i => i.id === id);
        if (!item || item.state === "matched") return;

        if (!selectedId) {
            // Select first
            setSelectedId(id);
            setItems(prev => prev.map(i => i.id === id ? { ...i, state: "selected" } : i));
        } else {
            // Select second - check match
            if (selectedId === id) return; // Clicked same one

            const first = items.find(i => i.id === selectedId);
            if (!first) return;

            if (first.pairId === item.pairId) {
                // Match!
                setItems(prev => prev.map(i =>
                    (i.id === id || i.id === selectedId) ? { ...i, state: "matched" } : i
                ));
                setSelectedId(null);

                // Check if all matched
                const remaining = items.filter(i => i.state !== "matched" && i.id !== id && i.id !== selectedId).length;
                if (remaining === 0) {
                    confetti({
                        particleCount: 80,
                        spread: 70,
                        origin: { y: 0.6 },
                    });
                    setTimeout(onSuccess, 1000);
                }
            } else {
                // Wrong
                setItems(prev => prev.map(i =>
                    (i.id === id || i.id === selectedId) ? { ...i, state: "wrong" } : i
                ));

                // Shake/Reset after delay
                setTimeout(() => {
                    setItems(prev => prev.map(i =>
                        (i.id === id || i.id === selectedId) ? { ...i, state: "default" } : i
                    ));
                    setSelectedId(null);
                    onFailure();
                }, 800);
            }
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-center mb-8">{data.question}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleCardClick(item.id)}
                        disabled={item.state === "matched"}
                        className={cn(
                            "p-4 h-24 rounded-xl text-sm md:text-base font-medium transition-all duration-200 shadow-sm border-2",
                            item.state === "default" && "bg-card border-border hover:border-primary/50 hover:shadow-md",
                            item.state === "selected" && "bg-orange-100 border-orange-500 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200 scale-105",
                            item.state === "matched" && "bg-transparent border-transparent text-muted-foreground opacity-20 scale-90",
                            item.state === "wrong" && "bg-red-100 border-red-500 text-red-700 animate-shake dark:bg-red-900/30 dark:text-red-200"
                        )}
                    >
                        {item.text}
                    </button>
                ))}
            </div>
        </div>
    );
}
