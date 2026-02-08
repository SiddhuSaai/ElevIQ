'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Camera,
    Lightbulb,
    Target,
    Users,
    Trophy,
    Settings,
    User,
    LucideIcon,
} from 'lucide-react';
import { useSidebarStore } from '@/store/sidebar-store';

interface SectionConfig {
    name: string;
    icon: LucideIcon;
    paths: string[];
}

// Section configurations with their associated paths
const sections: SectionConfig[] = [
    {
        name: 'Overview',
        icon: LayoutDashboard,
        paths: ['/dashboard', '/expenses', '/analytics', '/networth']
    },
    {
        name: 'Tools',
        icon: Camera,
        paths: ['/scan', '/chat', '/calculator', '/bills', '/export', '/currency', '/alerts']
    },
    {
        name: 'Insights',
        icon: Lightbulb,
        paths: ['/insights', '/limits', '/compare']
    },
    {
        name: 'Planning',
        icon: Target,
        paths: ['/goals', '/recurring', '/reminders']
    },
    {
        name: 'Social',
        icon: Users,
        paths: ['/split', '/family']
    },
];

const bottomItems = [
    { href: '/achievements', icon: Trophy, label: 'Achievements' },
    { href: '/settings', icon: Settings, label: 'Settings' },
    { href: '/profile', icon: User, label: 'Profile' },
];

export default function IconRail() {
    const pathname = usePathname();
    const prevPathnameRef = useRef<string | null>(null);
    const { activeSection, setActiveSection } = useSidebarStore();

    const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

    // Check if any path in a section is active
    const isSectionActive = (paths: string[]) => paths.some(path => isActive(path));

    // Only sync active section when pathname ACTUALLY CHANGES (not on every render)
    useEffect(() => {
        if (!pathname) return;

        // Skip if pathname hasn't changed - allows manual section switching
        if (prevPathnameRef.current === pathname) return;

        // Update the previous pathname
        prevPathnameRef.current = pathname;

        // Find which section contains the current path
        for (const section of sections) {
            if (isSectionActive(section.paths)) {
                setActiveSection(section.name);
                return;
            }
        }

        // Check if it's a bottom item - don't change section for these
        const isBottomItem = bottomItems.some(item => isActive(item.href));
        if (isBottomItem) return;

    }, [pathname]); // Only depend on pathname, not activeSection

    return (
        <div className="w-14 h-[calc(100vh-56px)] bg-white dark:bg-[#0A0A0A] flex flex-col border-r border-gray-200 dark:border-white/5 flex-shrink-0">
            {/* Section Icons */}
            <nav className="flex-1 py-3 flex flex-col items-center gap-1 overflow-y-auto">
                {sections.map((section) => {
                    const Icon = section.icon;
                    const isSelected = activeSection === section.name;
                    const hasActivePath = isSectionActive(section.paths);

                    return (
                        <div key={section.name} className="relative group">
                            <button
                                onClick={() => setActiveSection(section.name)}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isSelected
                                    ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                                    : hasActivePath
                                        ? 'text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-white/5'
                                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                            </button>

                            {/* Tooltip */}
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                {section.name}
                            </div>

                            {/* Active indicator bar */}
                            {isSelected && (
                                <motion.div
                                    layoutId="activeSection"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r"
                                />
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Bottom Icons */}
            <div className="py-3 flex flex-col items-center gap-1 border-t border-gray-200 dark:border-white/5">
                {bottomItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <div key={item.href} className="relative group">
                            <Link
                                href={item.href}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${active
                                    ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                            </Link>
                            {/* Tooltip */}
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                {item.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
