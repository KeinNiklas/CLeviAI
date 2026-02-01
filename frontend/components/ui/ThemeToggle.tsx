"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/Button";

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Prevent hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <Button variant="ghost" size="icon" aria-label="Toggle theme"><Sun className="h-5 w-5 opacity-0" /></Button>;
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="rounded-full w-10 h-10 transition-colors hover:bg-secondary"
        >
            {theme === "dark" ? (
                <Moon className="h-5 w-5 text-foreground transition-all" />
            ) : (
                <Sun className="h-5 w-5 text-foreground transition-all" />
            )}
        </Button>
    );
}
