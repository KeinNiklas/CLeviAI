'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Star, Shield, Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function SubscriptionPage() {
    const { token, refreshUser, user } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const isPro = user?.tier === 'pro';

    const handleSubscribe = async () => {
        setIsProcessing(true);

        // Simulate payment delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const res = await fetch('http://localhost:8000/users/me/upgrade', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setIsSuccess(true);
                // Wait for success animation
                await new Promise(resolve => setTimeout(resolve, 1500));
                await refreshUser(); // Update context to reflect new tier
                router.push('/dashboard');
            } else {
                alert("Payment failed. Please try again.");
                setIsProcessing(false);
            }
        } catch (error) {
            console.error("Upgrade failed", error);
            alert("An error occurred. Please try again.");
            setIsProcessing(false);
        }
    };

    const handleDowngrade = async () => {
        if (!confirm(t.subscription.confirm_cancel)) return;
        setIsProcessing(true);
        try {
            const res = await fetch('http://localhost:8000/users/me/downgrade', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                alert(t.subscription.cancel_success);
                await refreshUser();
                router.push('/dashboard');
            } else {
                alert(t.subscription.cancel_fail);
            }
        } catch (error) {
            console.error("Downgrade failed", error);
            alert("An error occurred.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (isPro) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
                <Link href="/dashboard" className="absolute top-8 left-8">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> {t.sidebar.back}
                    </Button>
                </Link>

                <Card className="w-full max-w-md border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                            <Star className="w-6 h-6 text-white fill-white" />
                        </div>
                        <CardTitle className="text-3xl font-bold">{t.subscription.manage_title}</CardTitle>
                        <CardDescription className="text-lg mt-2">{t.subscription.manage_desc}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t.subscription.status_label}</span>
                                <span className="font-medium text-green-500">{t.subscription.status_active}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t.subscription.next_billing}</span>
                                <span className="font-medium">March 15, 2026</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t.subscription.amount_label}</span>
                                <span className="font-medium">{t.subscription.price} {t.subscription.month}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={handleDowngrade}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : t.subscription.cancel_btn}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]" />

            <Link href="/dashboard" className="absolute top-8 left-8">
                <Button variant="ghost" className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> {t.sidebar.back}
                </Button>
            </Link>

            <AnimatePresence mode="wait">
                {!isSuccess ? (
                    <motion.div
                        key="pricing-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-md"
                    >
                        <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none" />

                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                                    <Star className="w-6 h-6 text-white fill-white" />
                                </div>
                                <CardTitle className="text-3xl font-bold">{t.subscription.title}</CardTitle>
                                <CardDescription className="text-lg mt-2">{t.subscription.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6 pt-6">
                                <div className="flex justify-center items-baseline gap-1">
                                    <span className="text-4xl font-bold">{t.subscription.price}</span>
                                    <span className="text-muted-foreground">{t.subscription.month}</span>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        t.subscription.feat_unlimited,
                                        t.subscription.feat_analytics,
                                        t.subscription.feat_ai,
                                        t.subscription.feat_support
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-green-500" />
                                            </div>
                                            <span className="text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    className="w-full h-12 text-lg font-medium bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all shadow-lg hover:shadow-primary/25"
                                    onClick={handleSubscribe}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" /> {t.subscription.processing}
                                        </span>
                                    ) : (
                                        t.subscription.subscribe_btn
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success-message"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="text-center space-y-4"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30"
                        >
                            <Check className="w-12 h-12 text-white stroke-[3]" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                            {t.subscription.success_title}
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            {t.subscription.success_msg}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
