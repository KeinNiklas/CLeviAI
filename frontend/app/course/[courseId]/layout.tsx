"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Book, CheckCircle, ChevronLeft, Menu, PlayCircle, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { t } = useLanguage();

  // Mock Data for Sidebar (Titles could also be translated if dynamic, but here hardcoded for demo)
  const chapters = [
    {
      title: "Introduction to AI",
      lessons: [
        { id: "1", title: "What is Artificial Intelligence?", completed: true },
        { id: "2", title: "History of AI", completed: true },
        { id: "3", title: "Types of Machine Learning", completed: false },
      ],
    },
    {
      title: "Neural Networks",
      lessons: [
        { id: "4", title: "Neurons and Perceptrons", completed: false },
        { id: "5", title: "Activation Functions", completed: false },
        { id: "6", title: "Backpropagation", completed: false },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-card/30 backdrop-blur-xl border-r border-white/5 transition-all duration-300 flex flex-col ${isSidebarOpen ? "w-80" : "w-0 -ml-80"
          } relative`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-white/5 min-w-[320px]">
          <Link
            href="/"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors absolute left-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            {t.sidebar.back}
          </Link>
          <span className="ml-[3.5rem] font-semibold truncate w-40">
            {t.sidebar.content}
          </span>
        </div>

        {/* Chapters List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 min-w-[320px]">
          {chapters.map((chapter, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-2">
                Chapter {idx + 1}: {chapter.title}
              </h3>
              <div className="space-y-1">
                {chapter.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    className="w-full flex items-center p-2 rounded-lg hover:bg-white/5 text-left group transition-colors"
                  >
                    <div className="mr-3">
                      {lesson.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <PlayCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${lesson.completed
                        ? "text-muted-foreground line-through decoration-white/20"
                        : "text-foreground group-hover:text-primary transition-colors"
                        }`}
                    >
                      {lesson.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer with Settings & Progress */}
        <div className="p-4 border-t border-white/5 min-w-[320px] space-y-4">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{t.sidebar.progress}</span>
              <span>33%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-1/3 rounded-full" />
            </div>
          </div>

          {/* Settings Link */}
          <Link href="/settings" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-white/5 rounded-lg">
            <Settings className="w-4 h-4 mr-2" />
            {t.settings.title}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-md flex items-center px-6 justify-between z-10">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mr-4"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold truncate">
              Introduction to AI
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center text-sm text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <Book className="w-4 h-4 mr-2 text-indigo-400" />
              6 {t.dashboard.remaining}
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth">
          <div className="max-w-4xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
