"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, LogOut, LayoutDashboard, FileText, Shield, CreditCard } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function UserMenu() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    // Get initials
    const initials = user.full_name
        ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
        : "U";

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20 outline-none focus:ring-2 focus:ring-primary/50"
            >
                <span className="font-semibold text-primary">{initials}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex flex-col items-center justify-center p-6 border-b border-border/50 bg-secondary/30">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-xl font-bold text-primary border border-primary/20">
                                {initials}
                            </div>
                            <h3 className="font-semibold text-lg text-foreground">{user.full_name}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                            <Link
                                href="/dashboard"
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors text-sm font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                <LayoutDashboard className="w-4 h-4 text-primary" />
                                <span>{t.navbar.profile_dashboard || "Dashboard"}</span>
                            </Link>

                            <Link
                                href="/plan"
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors text-sm font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                <FileText className="w-4 h-4 text-primary" />
                                <span>{t.navbar.new_journey || "New Plan"}</span>
                            </Link>

                            {user.role === "admin" && (
                                <Link
                                    href="/admin"
                                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors text-sm font-medium"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Shield className="w-4 h-4 text-primary" />
                                    <span>{t.user_menu.administration}</span>
                                </Link>
                            )}

                            <Link
                                href="/settings"
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors text-sm font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                <Settings className="w-4 h-4 text-primary" />
                                <span>{t.user_menu.settings}</span>
                            </Link>

                            {user.tier === 'pro' && (
                                <Link
                                    href="/subscription"
                                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors text-sm font-medium"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <CreditCard className="w-4 h-4 text-primary" />
                                    <span>{t.user_menu.manage_subscription}</span>
                                </Link>
                            )}

                            <button
                                onClick={() => {
                                    logout();
                                    setIsOpen(false);
                                }}
                                className="flex w-full items-center space-x-3 px-4 py-3 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-sm font-medium mt-1"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>{t.user_menu.logout}</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
