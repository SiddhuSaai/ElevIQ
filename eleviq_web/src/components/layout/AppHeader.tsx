'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Bell,
    ChevronRight,
    Command,
    X,
    User,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useTheme } from '@/contexts/theme-context';

// Breadcrumb mapping for readable names
const pathLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    expenses: 'Expenses',
    analytics: 'Analytics',
    networth: 'Net Worth',
    scan: 'Scan Receipt',
    chat: 'AI Assistant',
    calculator: 'Calculators',
    bills: 'Bill Calendar',
    export: 'Export',
    insights: 'Insights',
    limits: 'Spending Limits',
    compare: 'Compare',
    goals: 'Goals',
    recurring: 'Recurring',
    reminders: 'Reminders',
    split: 'Split Expenses',
    family: 'Family Budget',
    achievements: 'Achievements',
    settings: 'Settings',
    profile: 'Profile',
    add: 'Add',
    alerts: 'Alerts',
};

export default function AppHeader() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const { actualTheme } = useTheme();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasNotifications, setHasNotifications] = useState(true);

    // Generate breadcrumbs from pathname
    const generateBreadcrumbs = () => {
        const paths = pathname?.split('/').filter(Boolean) || [];
        return paths.map((path, index) => ({
            label: pathLabels[path] || path.charAt(0).toUpperCase() + path.slice(1),
            href: '/' + paths.slice(0, index + 1).join('/'),
            isLast: index === paths.length - 1,
        }));
    };

    const breadcrumbs = generateBreadcrumbs();

    // Handle keyboard shortcut for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <header className="h-14 bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-6 sticky top-0 z-50">
                {/* Left Section - Logo & Breadcrumbs */}
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex-shrink-0">
                        <Image
                            src={actualTheme === 'dark' ? '/ElevIQ_White.png' : '/ElevIQ logo with gold accents-2.png'}
                            alt="ElevIQ"
                            width={140}
                            height={40}
                            className="h-10 w-auto object-contain"
                            priority
                        />
                    </Link>

                    {/* Separator */}
                    <div className="h-6 w-px bg-gray-200 dark:bg-white/10" />

                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-1 text-sm">
                        {breadcrumbs.map((crumb, index) => (
                            <div key={crumb.href} className="flex items-center gap-1">
                                {index > 0 && (
                                    <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                )}
                                {crumb.isLast ? (
                                    <span className="text-gray-900 dark:text-white font-medium">
                                        {crumb.label}
                                    </span>
                                ) : (
                                    <Link
                                        href={crumb.href}
                                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                    >
                                        {crumb.label}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Right Section - Search, Notifications, Profile */}
                <div className="flex items-center gap-2">
                    {/* Search Button */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 text-sm transition-colors"
                    >
                        <Search className="w-4 h-4" />
                        <span className="hidden sm:inline">Search...</span>
                        <span className="hidden sm:flex items-center gap-0.5 text-xs text-gray-400 dark:text-gray-500 ml-2">
                            <Command className="w-3 h-3" />K
                        </span>
                    </button>

                    {/* Notifications */}
                    <Link
                        href="/alerts"
                        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                        <Bell className="w-5 h-5" />
                        {hasNotifications && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                    </Link>

                    {/* Profile */}
                    <Link
                        href="/profile"
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                            {user?.displayName?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                        </div>
                    </Link>
                </div>
            </header>

            {/* Search Modal */}
            <AnimatePresence>
                {isSearchOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSearchOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50"
                        />

                        {/* Search Dialog */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.15 }}
                            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 z-50 overflow-hidden"
                        >
                            {/* Search Input */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/5">
                                <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search expenses, categories, insights..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                                    autoFocus
                                />
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5"
                                >
                                    <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                </button>
                            </div>

                            {/* Quick Links */}
                            <div className="p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                                    Quick Actions
                                </p>
                                <div className="space-y-1">
                                    <Link
                                        href="/expenses/add"
                                        onClick={() => setIsSearchOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-sm text-gray-700 dark:text-gray-300"
                                    >
                                        <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-medium">+</span>
                                        Add New Expense
                                    </Link>
                                    <Link
                                        href="/scan"
                                        onClick={() => setIsSearchOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-sm text-gray-700 dark:text-gray-300"
                                    >
                                        <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-medium">📷</span>
                                        Scan Receipt
                                    </Link>
                                    <Link
                                        href="/chat"
                                        onClick={() => setIsSearchOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-sm text-gray-700 dark:text-gray-300"
                                    >
                                        <span className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xs font-medium">💬</span>
                                        Ask AI Assistant
                                    </Link>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-2 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                                <span>Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 font-medium">↵</kbd> to search</span>
                                <span>Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 font-medium">ESC</kbd> to close</span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
