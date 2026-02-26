"use client";

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import { useRouter, usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

import { useAuth } from "@/context/AuthContext";
import { UserMenu } from "@/components/UserMenu";
// ... imports

export function Navbar() {
    const { t } = useLanguage();
    const { isAuthenticated, logout } = useAuth();
    const [bouncers, setBouncers] = useState<number[]>([]);
    const router = useRouter();
    const pathname = usePathname();
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();

        if (clickTimeoutRef.current) {
            // Double click detected!
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
            triggerEasterEgg();
        } else {
            // First click - wait briefly to see if it's a double click
            clickTimeoutRef.current = setTimeout(() => {
                router.push("/");
                clickTimeoutRef.current = null;
            }, 300);
        }
    };

    const triggerEasterEgg = () => {
        const id = Date.now() + Math.random();
        setBouncers(prev => [...prev, id]);
        // Stop after 5 seconds
        setTimeout(() => {
            setBouncers(prev => prev.filter(b => b !== id));
        }, 5000);
    };

    return (
        <>
            <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 sticky top-0">
                <div className="flex h-14 items-center px-4 w-full">
                    <div className="mr-4 hidden md:flex">
                        <a
                            className="mr-6 flex items-center space-x-2 font-bold cursor-pointer select-none"
                            href="/"
                            onClick={handleLogoClick}
                        >
                            <Image
                                src="/logo.jpg"
                                alt="CLeviAI Logo"
                                width={32}
                                height={32}
                                className="rounded-full border border-orange-500/20"
                            />
                            <span>CLeviAI</span>
                        </a>
                        {isAuthenticated && (
                            <nav className="flex items-center gap-6 text-sm">
                                <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/plan">{t.navbar.new_journey}</a>
                                <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/dashboard">{t.navbar.profile_dashboard}</a>
                            </nav>
                        )}
                    </div>
                    <div className="ml-auto hidden md:flex items-center space-x-4">
                        {pathname === "/" && (
                            <div className="mr-2">
                                <ThemeToggle />
                            </div>
                        )}
                        {isAuthenticated ? (
                            <UserMenu />
                        ) : (
                            <a
                                className="transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer"
                                onClick={() => router.push('/login')}
                            >
                                <User className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                </div>
            </nav>
            {bouncers.map(id => <SmettanBouncer key={id} />)}
        </>
    );
}

function SmettanBouncer() {
    const requestRef = useRef<number | null>(null);
    const [config, setConfig] = useState<{
        width: number;
        height: number;
        rotSpeed: number;
        initialized: boolean;
        image: string;
    }>({ width: 300, height: 300, rotSpeed: 0.2, initialized: false, image: "/smettan.png" });

    const [state, setState] = useState({ x: 0, y: 0, rotation: 0 });
    const velocityRef = useRef({ dx: 4, dy: 4 });

    useEffect(() => {
        // Initialize random values on client side only
        const scale = 0.5 + Math.random(); // 0.5 to 1.5 range
        const size = 300 * scale;

        const width = size;
        const height = size;

        // Random image selection
        const images = ["/smettan.png", "/lunte.png", "/hanel.png", "/sachse.png"];
        const randomImage = images[Math.floor(Math.random() * images.length)];

        setConfig({
            width,
            height,
            rotSpeed: (Math.random() < 0.5 ? -1 : 1) * 0.2,
            initialized: true,
            image: randomImage
        });

        // Set random start position ensuring it's within bounds
        setState({
            x: Math.random() * (window.innerWidth - width),
            y: Math.random() * (window.innerHeight - height),
            rotation: Math.random() * 360
        });

        // Random velocity direction
        velocityRef.current = {
            dx: (Math.random() < 0.5 ? -1 : 1) * 4,
            dy: (Math.random() < 0.5 ? -1 : 1) * 4
        };
    }, []);

    const animate = () => {
        if (!config.initialized) return;

        setState((prev) => {
            let { x, y, rotation } = prev;
            let { dx, dy } = velocityRef.current;

            // Check collisions
            if (x + dx > window.innerWidth - config.width || x + dx < 0) {
                dx = -dx;
            }
            if (y + dy > window.innerHeight - config.height || y + dy < 0) {
                dy = -dy;
            }

            // Update velocity ref
            velocityRef.current = { dx, dy };

            return {
                x: x + dx,
                y: y + dy,
                rotation: rotation + config.rotSpeed
            };
        });

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (config.initialized) {
            requestRef.current = requestAnimationFrame(animate);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [config.initialized]);

    if (!config.initialized) return null;

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
            <div
                className="absolute will-change-transform"
                style={{
                    transform: `translate(${state.x}px, ${state.y}px) rotate(${state.rotation}deg)`,
                    width: config.width,
                    height: config.height
                }}
            >
                <Image
                    src={config.image}
                    alt="Easter Egg Bouncer"
                    fill
                    className="object-contain drop-shadow-2xl"
                />
            </div>
        </div>
    );
}
