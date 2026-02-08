'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Receipt,
    LineChart,
    Wallet,
    Camera,
    MessageSquare,
    Calculator,
    CalendarCheck,
    Download,
    Lightbulb,
    Gauge,
    ArrowLeftRight,
    Target,
    Repeat,
    Clock,
    Users,
    Home,
    X,
    Plus,
    LogOut,
    LucideIcon,
} from 'lucide-react';
import { useSidebarStore } from '@/store/sidebar-store';
import { useAuthStore } from '@/store/auth-store';
import { AuthService } from '@/lib/firebase/auth';

interface NavItem {
    href: string;
    icon: LucideIcon;
    label: string;
}

// Section content configurations
const sectionContent: Record<string, NavItem[]> = {
    Overview: [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/expenses', icon: Receipt, label: 'Expenses' },
        { href: '/analytics', icon: LineChart, label: 'Analytics' },
        { href: '/networth', icon: Wallet, label: 'Net Worth' },
    ],
    Tools: [
        { href: '/scan', icon: Camera, label: 'Scan Receipt' },
        { href: '/chat', icon: MessageSquare, label: 'AI Assistant' },
        { href: '/calculator', icon: Calculator, label: 'Calculators' },
        { href: '/bills', icon: CalendarCheck, label: 'Bill Calendar' },
        { href: '/currency', icon: ArrowLeftRight, label: 'Currency' },
        { href: '/alerts', icon: Gauge, label: 'Budget Alerts' },
        { href: '/export', icon: Download, label: 'Export Data' },
    ],
    Insights: [
        { href: '/insights', icon: Lightbulb, label: 'Smart Insights' },
        { href: '/limits', icon: Gauge, label: 'Spending Limits' },
        { href: '/compare', icon: ArrowLeftRight, label: 'Compare' },
    ],
    Planning: [
        { href: '/goals', icon: Target, label: 'Goals' },
        { href: '/recurring', icon: Repeat, label: 'Recurring' },
        { href: '/reminders', icon: Clock, label: 'Reminders' },
    ],
    Social: [
        { href: '/split', icon: Users, label: 'Split Expenses' },
        { href: '/family', icon: Home, label: 'Family Budget' },
    ],
};

export default function SidebarPanel() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, reset } = useAuthStore();
    const { isExpanded, activeSection, collapseSidebar } = useSidebarStore();

    const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

    const handleLogout = async () => {
        await AuthService.signOut();
        reset();
        router.push('/login');
    };

    const currentItems = sectionContent[activeSection] || [];

    return (
        <AnimatePresence>
            {isExpanded && (
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="h-[calc(100vh-56px)] bg-gray-50 dark:bg-[#111111] flex flex-col border-r border-gray-200 dark:border-white/5 overflow-hidden flex-shrink-0"
                >
                    {/* Panel Header - Shows Active Section Name */}
                    <div className="h-12 px-4 flex items-center justify-between border-b border-gray-200 dark:border-white/5">
                        <span className="text-gray-900 dark:text-white font-semibold text-sm">{activeSection}</span>
                        <button
                            onClick={collapseSidebar}
                            className="w-6 h-6 rounded flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Quick Action (only for Overview) */}
                    {activeSection === 'Overview' && (
                        <div className="px-3 py-3">
                            <Link
                                href="/expenses/add"
                                className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                New Expense
                            </Link>
                        </div>
                    )}

                    {/* Navigation Items for Active Section */}
                    <nav className="flex-1 overflow-y-auto px-3 py-2">
                        <AnimatePresence mode="wait">
                            <motion.ul
                                key={activeSection}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.15 }}
                                className="space-y-1"
                            >
                                {currentItems.map((item, index) => {
                                    const active = isActive(item.href);
                                    const Icon = item.icon;

                                    return (
                                        <motion.li
                                            key={item.href}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.04 }}
                                        >
                                            <Link
                                                href={item.href}
                                                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active
                                                    ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
                                                    }`}
                                            >
                                                {active && (
                                                    <motion.div
                                                        layoutId="activeNavItem"
                                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r"
                                                    />
                                                )}
                                                <Icon className="w-4 h-4" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </motion.li>
                                    );
                                })}
                            </motion.ul>
                        </AnimatePresence>
                    </nav>

                    {/* User Section */}
                    <div className="p-3 border-t border-gray-200 dark:border-white/5">
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                {user?.displayName?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user?.displayName || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                    {user?.email}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors flex-shrink-0"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
