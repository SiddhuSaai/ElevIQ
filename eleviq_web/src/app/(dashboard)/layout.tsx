'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import AppSidebar from '@/components/layout/AppSidebar';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/navigation/bottom-nav';
import { useSidebarStore } from '@/store/sidebar-store';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthStore();
    const { isExpanded } = useSidebarStore();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Calculate main content margin based on sidebar state
    // Icon rail: 56px, Panel: 220px (when expanded)
    const sidebarWidth = isExpanded ? 56 + 220 : 56;

    return (
        <div className="h-screen overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
            {/* Desktop Layout */}
            <div className="hidden lg:block">
                {/* Header - Full Width at Top */}
                <AppHeader />

                {/* Content Area with Sidebar */}
                <div className="flex">
                    {/* Sidebar - Fixed below header */}
                    <AppSidebar className="fixed left-0 top-14 z-40" />

                    {/* Main Content */}
                    <main
                        className="flex-1 h-[calc(100vh-56px)] overflow-y-auto transition-[margin] duration-200"
                        style={{ marginLeft: sidebarWidth }}
                    >
                        {children}
                    </main>
                </div>
            </div>

            {/* Mobile/Tablet Layout - Bottom Nav */}
            <div className="lg:hidden">
                <main className="pb-20">
                    {children}
                </main>
                <BottomNav />
            </div>
        </div>
    );
}
