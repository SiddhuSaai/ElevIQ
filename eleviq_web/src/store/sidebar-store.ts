import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarStore {
    // State
    isExpanded: boolean;
    activeSection: string;

    // Actions
    toggleSidebar: () => void;
    setActiveSection: (section: string) => void;
    collapseSidebar: () => void;
    expandSidebar: () => void;
}

export const useSidebarStore = create<SidebarStore>()(
    persist(
        (set) => ({
            // Initial state
            isExpanded: true,
            activeSection: 'Overview',

            // Actions
            toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),

            setActiveSection: (section: string) => set({ activeSection: section, isExpanded: true }),

            collapseSidebar: () => set({ isExpanded: false }),

            expandSidebar: () => set({ isExpanded: true }),
        }),
        {
            name: 'eleviq-sidebar-state',
        }
    )
);
