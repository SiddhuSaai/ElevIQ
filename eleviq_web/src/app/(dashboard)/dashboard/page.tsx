'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Wallet, TrendingUp, PiggyBank, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/lib/firebase/auth';
import { useAuthStore } from '@/store/auth-store';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, reset } = useAuthStore();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    const handleLogout = async () => {
        await AuthService.signOut();
        reset();
        router.push('/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                            <Wallet size={20} />
                        </div>
                        <span className="text-xl font-bold text-slate-900">ELEVIQ</span>
                    </div>
                    <Button variant="ghost" onClick={handleLogout}>
                        <LogOut size={18} className="mr-2" />
                        Logout
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-8 shadow-xl shadow-blue-600/20">
                    <h1 className="text-2xl font-bold mb-2">
                        Welcome back, {user?.displayName || 'User'}! 👋
                    </h1>
                    <p className="text-blue-100">
                        Your personal finance dashboard is ready. Start tracking your expenses!
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Total Income</p>
                                <p className="text-2xl font-bold text-slate-900">₹0</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                                <PiggyBank size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Total Expenses</p>
                                <p className="text-2xl font-bold text-slate-900">₹0</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                <MessageCircle size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">AI Suggestions</p>
                                <p className="text-2xl font-bold text-slate-900">0</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coming Soon */}
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg shadow-slate-200/50">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-4">
                        <Wallet size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                        Dashboard Coming Soon!
                    </h2>
                    <p className="text-slate-500 max-w-md mx-auto">
                        The expense tracking, analytics, and AI chatbot features are being developed.
                        Check back soon for the full ELEVIQ experience!
                    </p>
                </div>
            </main>
        </div>
    );
}
