'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const PUBLIC_PATHS = ['/', '/login', '/register'];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    useEffect(() => {
        if (!isLoading && !isAuthenticated && !isPublicPath) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, isPublicPath, router]);

    if (isPublicPath) {
        return <>{children}</>;
    }

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
