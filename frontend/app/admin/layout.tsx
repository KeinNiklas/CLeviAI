'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Settings, Users, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useLanguage } from '@/lib/LanguageContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'admin')) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user || user.role !== 'admin') {
        return null; // Or a loading spinner
    }

    const navigation = [
        { name: t.admin.nav_general, href: '/admin/general', icon: Settings },
        { name: t.admin.nav_users, href: '/admin/users', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <div className="container mx-auto px-4 py-8 flex gap-8">
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0">
                    <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4 sticky top-24">
                        <div className="flex items-center space-x-2 mb-6 px-2">
                            <Shield className="w-5 h-5 text-primary" />
                            <h2 className="font-semibold text-lg">{t.admin.title}</h2>
                        </div>
                        <nav className="space-y-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
