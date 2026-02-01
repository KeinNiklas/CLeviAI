"use client";

import * as React from "react";
import { Play, Pause, X, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { useLanguage } from "@/lib/LanguageContext";

interface PodcastPlayerProps {
    topicTitle: string;
    topicDescription: string;
    onClose: () => void;
}

interface PodcastLine {
    speaker: string;
    text: string;
}

export function PodcastPlayer({ topicTitle, topicDescription, onClose }: PodcastPlayerProps) {
    const { language } = useLanguage();
    const [loading, setLoading] = React.useState(true);
    const [script, setScript] = React.useState<PodcastLine[]>([]);
    const [title, setTitle] = React.useState("");
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentLineIndex, setCurrentLineIndex] = React.useState(-1);
    const [loadingAudio, setLoadingAudio] = React.useState(false);

    // Audio Ref
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const shouldPlayRef = React.useRef(false);

    // Fetch Script
    React.useEffect(() => {
        const fetchScript = async () => {
            try {
                const res = await fetch("http://localhost:8000/podcast/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        topic_title: topicTitle,
                        topic_description: topicDescription,
                        language: language
                    })
                });
                if (!res.ok) throw new Error("Failed to generate");
                const data = await res.json();
                setScript(data.script);
                setTitle(data.title);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchScript();

        return () => {
            stopPlayback();
        };
    }, [topicTitle, topicDescription, language]);

    const playLine = async (index: number) => {
        if (!shouldPlayRef.current) return;

        if (index >= script.length) {
            stopPlayback();
            setCurrentLineIndex(-1);
            return;
        }

        const line = script[index];
        setCurrentLineIndex(index);
        setLoadingAudio(true);

        try {
            // Fetch Audio Blob
            const res = await fetch("http://localhost:8000/podcast/audio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: line.text,
                    speaker: line.speaker,
                    language: language
                })
            });

            if (!res.ok) throw new Error("Audio generation failed");

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);

            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.playbackRate = 1.0;

                // Event Listener for completion to trigger next line
                audioRef.current.onended = () => {
                    URL.revokeObjectURL(url); // Cleanup
                    if (shouldPlayRef.current) {
                        playLine(index + 1);
                    }
                };

                // Play
                await audioRef.current.play();
                setLoadingAudio(false);
            }

        } catch (error) {
            console.error("Audio Playback Error", error);
            setLoadingAudio(false);
            setIsPlaying(false);
        }
    };

    const startPlayback = () => {
        shouldPlayRef.current = true;
        setIsPlaying(true);

        // Init Audio Element
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }

        const startIndex = currentLineIndex === -1 ? 0 : currentLineIndex;
        playLine(startIndex);
    };

    const stopPlayback = () => {
        shouldPlayRef.current = false;
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            stopPlayback();
        } else {
            startPlayback();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg h-[600px] flex flex-col bg-background border-border shadow-2xl animate-fade-in-up">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Volume2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-none">{title || "Generating Podcast..."}</h3>
                            <p className="text-xs text-muted-foreground">AI Generated • {topicTitle}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p>Writing script & casting voices...</p>
                        </div>
                    ) : (
                        script.map((line, i) => (
                            <div
                                key={i}
                                className={`flex flex-col space-y-1 p-3 rounded-lg transition-colors ${currentLineIndex === i
                                    ? "bg-primary/10 border border-primary/20 shadow-sm scale-105"
                                    : "opacity-80 hover:bg-secondary/30"
                                    } ${line.speaker === "Student" ? "items-end text-right" : "items-start"}`}
                            >
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${line.speaker === "Expert" ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"
                                    }`}>
                                    {line.speaker}
                                </span>
                                <p className="text-sm leading-relaxed">{line.text}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Controls */}
                <div className="p-4 border-t border-border bg-secondary/10">
                    {loadingAudio && isPlaying && (
                        <div className="text-center text-xs text-muted-foreground mb-2 animate-pulse">
                            Generating Audio...
                        </div>
                    )}
                    <Button
                        className={`w-full h-12 text-lg shadow-lg transition-all ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
                        onClick={togglePlay}
                        disabled={loading}
                    >
                        {loadingAudio ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : isPlaying ? (
                            <>
                                <Pause className="w-5 h-5 mr-2" /> Stop
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5 mr-2" /> Play Episode
                            </>
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
