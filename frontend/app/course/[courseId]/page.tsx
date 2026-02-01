"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Clock, Play, Trophy } from "lucide-react";

export default function CourseOverviewPage() {
    const { t } = useLanguage();

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Course Header */}
            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight"> Introduction to AI</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    Unlock the power of artificial intelligence. This course covers everything from the basic definitions to the complex mechanisms of neural networks.
                </p>
                <div className="flex items-center space-x-6 pt-4">
                    <Button size="lg" className="shadow-xl shadow-primary/20">
                        <Play className="w-5 h-5 mr-2 fill-current" />
                        {t.dashboard.continue}
                    </Button>
                    <div className="flex items-center space-x-2 text-slate-400">
                        <Clock className="w-5 h-5" />
                        <span>2h 15m {t.dashboard.remaining}</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    icon={<Trophy className="w-6 h-6 text-amber-400" />}
                    label={t.dashboard.streak}
                    value={`3 ${t.dashboard.days}`}
                />
                <StatsCard
                    icon={<div className="font-bold text-green-400">33%</div>}
                    label={t.dashboard.completed}
                    value={`2/6 ${t.dashboard.modules}`}
                />
                <StatsCard
                    icon={<div className="font-bold text-purple-400">A+</div>}
                    label={t.dashboard.score}
                    value="92%"
                />
            </div>

            {/* Recent Activity Section */}
            <div className="pt-8">
                <h3 className="text-xl font-semibold mb-4">{t.dashboard.up_next}</h3>
                <Card className="hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="p-6 flex items-center justify-between">
                        <div>
                            <div className="text-sm text-indigo-400 font-medium mb-1">Chapter 1 • Lesson 3</div>
                            <h4 className="text-lg font-semibold group-hover:text-primary transition-colors">Types of Machine Learning</h4>
                        </div>
                        <Button variant="ghost" className="group-hover:translate-x-1 transition-transform">
                            {t.dashboard.start}
                            <Play className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function StatsCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <Card className="bg-card/30">
            <div className="p-6 flex items-center space-x-4">
                <div className="p-3 bg-white/5 rounded-xl">
                    {icon}
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                    <div className="text-2xl font-bold">{value}</div>
                </div>
            </div>
        </Card>
    )
}
