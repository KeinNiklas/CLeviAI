
"use client";

import * as React from "react";
import { X, ChevronLeft, ChevronRight, RotateCw, CheckCircle2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Flashcard {
    question: string;
    answer: string;
}

interface FlashcardViewerProps {
    topicTitle: string;
    flashcards: Flashcard[];
    onClose: () => void;
}

export function FlashcardViewer({ topicTitle, flashcards, onClose }: FlashcardViewerProps) {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [isFlipped, setIsFlipped] = React.useState(false);

    if (!flashcards || flashcards.length === 0) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                <div className="bg-card border border-border p-6 rounded-xl shadow-2xl max-w-md w-full text-center">
                    <h3 className="text-xl font-bold mb-2">No Flashcards Generated</h3>
                    <p className="text-muted-foreground mb-6">AI didn't generate flashcards for this topic.</p>
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-card/50 border border-border p-1 rounded-xl shadow-2xl max-w-2xl w-full h-[600px] flex flex-col relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/40 bg-card">
                    <div className="flex items-center space-x-2">
                        <RotateCw className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">{topicTitle}</h3>
                        <span className="text-muted-foreground text-sm ml-2">
                            ({currentIndex + 1} / {flashcards.length})
                        </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Card Arena */}
                <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-background to-secondary/20 relative">
                    <div
                        className="relative w-full max-w-xl aspect-[3/2] cursor-pointer perspective-1000 group"
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <div
                            className={`w-full h-full relative preserve-3d transition-all duration-500 ease-in-out ${isFlipped ? 'rotate-y-180' : ''}`}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* Front */}
                            <div className="absolute inset-0 backface-hidden bg-card border border-border shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors">
                                <HelpCircle className="w-10 h-10 text-primary mb-4 opacity-50" />
                                <h4 className="text-xl font-medium text-muted-foreground mb-4 uppercase tracking-widest text-xs">Question</h4>
                                <p className="text-2xl font-semibold leading-relaxed">{currentCard.question}</p>
                                <p className="text-xs text-muted-foreground mt-8 opacity-60">Click to flip</p>
                            </div>

                            {/* Back */}
                            <div
                                className="absolute inset-0 backface-hidden bg-primary/5 border border-primary/20 shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center text-center rotate-y-180"
                            >
                                <CheckCircle2 className="w-10 h-10 text-primary mb-4" />
                                <h4 className="text-xl font-medium text-primary mb-4 uppercase tracking-widest text-xs">Answer</h4>
                                <p className="text-xl leading-relaxed">{currentCard.answer}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="p-6 bg-card border-t border-border flex justify-between items-center">
                    <Button variant="outline" onClick={handlePrev} disabled={flashcards.length <= 1}>
                        <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                    </Button>

                    <div className="flex space-x-2">
                        <Button
                            className="w-32"
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            {isFlipped ? "Show Question" : "Show Answer"}
                        </Button>
                    </div>

                    <Button variant="outline" onClick={handleNext} disabled={flashcards.length <= 1}>
                        Next <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
