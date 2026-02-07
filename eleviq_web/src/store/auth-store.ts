import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export type UserType = 'student' | 'professional' | null;

interface AuthState {
    user: User | null;
    userType: UserType;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    setUser: (user: User | null) => void;
    setUserType: (type: UserType) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
    reset: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            userType: null,
            isLoading: true,
            isAuthenticated: false,
            error: null,
            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: !!user,
                    isLoading: false,
                }),
            setUserType: (userType) => set({ userType }),
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),
            reset: () =>
                set({
                    user: null,
                    userType: null,
                    isLoading: false,
                    isAuthenticated: false,
                    error: null,
                }),
        }),
        {
            name: 'eleviq-auth',
            partialize: (state) => ({ userType: state.userType }),
        }
    )
);

// Initialize auth state listener only on client side with valid auth
if (typeof window !== 'undefined' && auth) {
    onAuthStateChanged(auth, (user) => {
        useAuthStore.getState().setUser(user);
    });
} else if (typeof window !== 'undefined') {
    // No Firebase auth - mark as not loading
    useAuthStore.getState().setLoading(false);
}
