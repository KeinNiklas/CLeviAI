"use client";

import * as React from "react";
import { Play, Pause, X, Loader2, Volume2, Settings2, SkipForward, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/lib/LanguageContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";

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

    // State: Script
    const [loadingScript, setLoadingScript] = React.useState(false);
    const [script, setScript] = React.useState<PodcastLine[]>([]);
    const [podcastTitle, setPodcastTitle] = React.useState("");

    // State: Playback
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentIndex, setCurrentIndex] = React.useState(-1);

    // State: Audio Cache & Buffering
    // cache[index] = "blob:url..."
    const [audioCache, setAudioCache] = React.useState<Record<number, string>>({});
    const [bufferingIndex, setBufferingIndex] = React.useState<number | null>(null);
    const [rateLimitError, setRateLimitError] = React.useState<string | null>(null);

    // State: Settings
    const [preset, setPreset] = React.useState("classroom");
    const [showSettings, setShowSettings] = React.useState(true);

    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const shouldPlayRef = React.useRef(false);

    // --- Audio Queue Logic ---

    async function generateScript(selectedPreset: string) {
        setLoadingScript(true);
        setScript([]);
        setAudioCache({});
        setCurrentIndex(-1);
        stopPlayback();
        setRateLimitError(null);

        try {
            const res = await fetch("/api/podcast/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic_title: topicTitle,
                    topic_description: topicDescription,
                    language: language,
                    preset: selectedPreset
                })
            });
            if (!res.ok) throw new Error("Failed to generate");
            const data = await res.json();
            setScript(data.script);
            setPodcastTitle(data.title);
            setShowSettings(false);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingScript(false);
        }
    }

    // 1. Fetch Audio for a specific index
    async function fetchAudio(index: number) {
        if (index >= script.length) return null;
        if (audioCache[index]) return audioCache[index];

        try {
            const line = script[index];
            const res = await fetch("/api/podcast/audio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: line.text,
                    speaker: line.speaker,
                    language: language
                })
            });

            if (res.status === 429) {
                setRateLimitError("Rate Limit Reached (High Traffic). Please wait a moment before trying again.");
                shouldPlayRef.current = false;
                setIsPlaying(false);
                return null;
            }

            if (!res.ok) throw new Error(`Audio gen failed: ${res.status}`);
            const blob = await res.blob();

            if (!(blob instanceof Blob) || blob.size === 0) {
                throw new Error("Invalid audio blob received");
            }

            const url = URL.createObjectURL(blob);

            setRateLimitError(null); // Clear error on success
            setAudioCache(prev => ({ ...prev, [index]: url }));
            return url;
        } catch (e) {
            console.error("Audio fetch error", e);
            return null;
        }
    }

    // Aggressively buffer next 3 lines
    async function bufferLookahead(startIndex: number) {
        const lookahead = 3;
        for (let i = 1; i <= lookahead; i++) {
            const target = startIndex + i;
            if (target < script.length && !audioCache[target]) {
                fetchAudio(target);
            }
        }
    }

    // 2. Play specific index
    async function playIndex(index: number) {
        if (!shouldPlayRef.current) return;
        if (index >= script.length) {
            stopPlayback();
            setCurrentIndex(-1);
            return;
        }

        setCurrentIndex(index);

        // Trigger buffering for FUTURE lines immediately
        bufferLookahead(index);

        // Get Current Audio (Cache or Fetch)
        let url: string | null | undefined = audioCache[index];

        // If not cached, we are buffering THIS line
        if (!url) {
            setBufferingIndex(index);
            url = await fetchAudio(index); // fetchAudio returns null on failure
            setBufferingIndex(null);
        }

        if (!shouldPlayRef.current) return;

        // If URL is missing (failed fetch or rate limit), just stop
        if (!url) {
            console.warn("Audio missing for index", index);
            stopPlayback();
            return;
        }

        if (!audioRef.current) audioRef.current = new Audio();

        audioRef.current.src = url;
        audioRef.current.playbackRate = 1.0;

        audioRef.current.onended = () => {
            if (shouldPlayRef.current) {
                playIndex(index + 1);
            }
        };

        try {
            await audioRef.current.play();
        } catch (e) {
            console.error("Playback failed", e);
            stopPlayback();
        }
    }

    function startPlayback() {
        shouldPlayRef.current = true;
        setIsPlaying(true);
        const start = currentIndex === -1 ? 0 : currentIndex;
        playIndex(start);
    }

    function stopPlayback() {
        shouldPlayRef.current = false;
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }

    function togglePlay() {
        isPlaying ? stopPlayback() : startPlayback();
    }

    // Initial Load - Auto Generate Default
    React.useEffect(() => {
        if (script.length === 0 && !loadingScript) {
            generateScript("classroom");
        }
        return () => stopPlayback();
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-xl h-[700px] flex flex-col bg-background border-border shadow-2xl animate-fade-in-up overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-border bg-secondary/5">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Volume2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight w-64 truncate">{podcastTitle || "New Podcast"}</h3>
                            <p className="text-xs text-muted-foreground truncate w-64">{topicTitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
                            <Settings2 className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Rate Limit Alert */}
                {rateLimitError && (
                    <div className="bg-orange-500/10 border-l-4 border-orange-500 p-4 m-4 rounded flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-orange-600 dark:text-orange-400">Server Busy</p>
                            <p className="text-xs text-muted-foreground">{rateLimitError}</p>
                        </div>
                    </div>
                )}

                {/* Settings Panel (Overlay or Replace) */}
                {showSettings && (
                    <div className="p-4 bg-secondary/20 border-b border-border space-y-3">
                        <div className="flex flex-col space-y-1">
                            <label className="text-sm font-medium">Preset</label>
                            <Select value={preset} onValueChange={setPreset}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="classroom">🎓 Classroom (Student & Expert)</SelectItem>
                                    <SelectItem value="deep_dive">🔬 Deep Dive (Two Experts)</SelectItem>
                                    <SelectItem value="story">📖 Story Mode (Solo Narrator)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => generateScript(preset)}
                            disabled={loadingScript}
                        >
                            {loadingScript ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Regenerate Episode"}
                        </Button>
                    </div>
                )}

                {/* Script Display */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-background to-secondary/5">
                    {loadingScript ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4 text-muted-foreground">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-sm font-medium">Writing script...</p>
                        </div>
                    ) : script.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <p>No episodes yet. Generate one above!</p>
                        </div>
                    ) : (
                        script.map((line, i) => (
                            <div
                                key={i}
                                onClick={() => { stopPlayback(); playIndex(i); setIsPlaying(true); shouldPlayRef.current = true; }}
                                className={`
                                    flex flex-col space-y-2 p-4 rounded-xl transition-all cursor-pointer border
                                    ${currentIndex === i
                                        ? "bg-primary/20 border-primary shadow-md scale-[1.02]"
                                        : "bg-card border-transparent hover:bg-secondary/40 opacity-70 hover:opacity-100"
                                    } 
                                    ${line.speaker.includes("Student") ? "items-end text-right ml-8" : "items-start mr-8"}
                                `}
                            >
                                <span className={`
                                    text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full
                                    ${line.speaker.includes("Expert") ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" :
                                        line.speaker.includes("Student") ? "bg-green-500/20 text-green-600 dark:text-green-400" :
                                            line.speaker.includes("Lunte") ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" :
                                                "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                                    }
                                `}>
                                    {line.speaker}
                                </span>
                                <p className="text-sm md:text-base leading-relaxed font-medium">{line.text}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Floating Buffer Indicator */}
                {bufferingIndex !== null && isPlaying && !rateLimitError && (
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded-full flex items-center shadow-lg backdrop-blur-md z-10 transition-all">
                        <Loader2 className="w-3 h-3 animate-spin mr-2" />
                        Buffering next segment...
                    </div>
                )}

                {/* Controls */}
                <div className="p-6 border-t border-border bg-background shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
                    <div className="flex items-center space-x-4">
                        <Button
                            className="flex-1 h-14 text-lg font-bold shadow-xl transition-all rounded-2xl"
                            variant={isPlaying ? "destructive" : "default"}
                            onClick={togglePlay}
                            disabled={loadingScript || script.length === 0}
                        >
                            {isPlaying ? (
                                <>
                                    <Pause className="w-6 h-6 mr-3" /> Pause
                                </>
                            ) : (
                                <>
                                    <Play className="w-6 h-6 mr-3" /> Play
                                </>
                            )}
                        </Button>
                        <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl" onClick={() => {
                            if (currentIndex + 1 < script.length) {
                                stopPlayback();
                                playIndex(currentIndex + 1);
                                setIsPlaying(true);
                                shouldPlayRef.current = true;
                            }
                        }}>
                            <SkipForward className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
