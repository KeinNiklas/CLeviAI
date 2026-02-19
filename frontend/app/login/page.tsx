'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import { API_URL } from '@/lib/api';

export default function LoginPage() {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const res = await fetch(`/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || t.auth.login_failed);
            }

            const data = await res.json();
            login(data.access_token);
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[url('/grid-pattern.svg')] bg-cover px-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center space-y-2 pb-2">
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                            {t.auth.welcome}
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">
                            {t.auth.subtitle_login}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground ml-1">{t.auth.email}</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        placeholder={t.auth.email_placeholder}
                                        className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-transparent focus:border-primary/50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground/70"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground ml-1">{t.auth.password}</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-transparent focus:border-primary/50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground/70"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-11 text-base group"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        {t.auth.sign_in}
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>

                            <div className="text-center text-sm text-muted-foreground mt-4">
                                {t.auth.no_account}{' '}
                                <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline">
                                    {t.auth.register_here}
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
