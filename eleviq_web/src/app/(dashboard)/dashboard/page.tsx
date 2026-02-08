'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { useExpenseStore } from '@/store/expense-store';
import { useAuthStore } from '@/store/auth-store';
import { useUserNetWorth } from '@/hooks/useUserNetWorth';
import { useUserGoals } from '@/hooks/useUserGoals';
import { useBills } from '@/hooks/useBills';
import {
    NetWorthWidget,
    BillsWidget,
    GoalsWidget,
    InsightsWidget,
    SpendingWidget,
    TransactionsWidget,
    StreakWidget,
    QuickActionsWidget
} from '@/components/dashboard/widgets';
import { generateInsights, calculateStreak } from '@/lib/insights';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { expenses, monthlyTotal, categoryTotals, fetchExpenses, fetchStats } = useExpenseStore();

    // Use real data from Firestore hooks
    const { assets, liabilities } = useUserNetWorth();
    const { goals } = useUserGoals();
    const { upcomingBills } = useBills();

    useEffect(() => {
        fetchExpenses();
        fetchStats();
    }, [fetchExpenses, fetchStats]);

    // Transform data for widgets
    const widgetAssets = useMemo(() =>
        assets.map(a => ({
            type: a.category,
            name: a.name,
            amount: a.value,
        })), [assets]);

    const widgetLiabilities = useMemo(() =>
        liabilities.map(l => ({
            type: l.category,
            name: l.name,
            amount: l.value,
        })), [liabilities]);

    const widgetGoals = useMemo(() =>
        goals.map(g => ({
            id: g.id,
            name: g.name,
            targetAmount: g.targetAmount,
            currentAmount: g.currentAmount,
        })), [goals]);

    const widgetBills = useMemo(() =>
        upcomingBills.map(b => ({
            id: b.id,
            name: b.name,
            amount: b.amount,
            dueDate: new Date(b.dueDate),
            isPaid: b.isPaid,
            category: b.category,
        })), [upcomingBills]);

    // Calculate derived data
    const streak = useMemo(() => calculateStreak(expenses), [expenses]);
    const insights = useMemo(() => generateInsights(expenses, [], widgetBills), [expenses, widgetBills]);

    // Weekly stats for gamification
    const weeklyStats = useMemo(() => {
        const weekStart = startOfWeek(new Date());
        const weekEnd = endOfWeek(new Date());
        const weekExpenses = expenses.filter(e => e.date >= weekStart && e.date <= weekEnd);
        return {
            points: weekExpenses.length * 10, // 10 points per expense logged
            challenge: { current: weekExpenses.length, target: 7 },
        };
    }, [expenses]);

    // Total points from achievements
    const totalPoints = useMemo(() => {
        let points = 0;
        if (expenses.length >= 1) points += 10;
        if (expenses.length >= 10) points += 50;
        if (expenses.length >= 50) points += 200;
        if (streak >= 7) points += 100;
        return points + weeklyStats.points;
    }, [expenses, streak, weeklyStats.points]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
            {/* ========== MOBILE LAYOUT ========== */}
            <div className="lg:hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold">
                                Hi, {user?.displayName?.split(' ')[0] || 'there'}! 👋
                            </h1>
                            <p className="text-blue-100 text-sm mt-0.5">
                                {format(new Date(), 'EEEE, MMM d')}
                            </p>
                        </div>
                        <Link
                            href="/expenses/add"
                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                {/* Mobile Bento Grid */}
                <div className="px-4 py-6 pb-24 space-y-4">
                    {/* Quick Actions */}
                    <QuickActionsWidget />

                    {/* Net Worth - Full Width */}
                    <NetWorthWidget assets={widgetAssets} liabilities={widgetLiabilities} />

                    {/* Spending Widget */}
                    <SpendingWidget
                        monthlyTotal={monthlyTotal}
                        budget={60000}
                        categoryTotals={categoryTotals}
                        transactionCount={expenses.length}
                    />

                    {/* Bills Widget */}
                    <BillsWidget bills={widgetBills} />

                    {/* Goals Widget */}
                    <GoalsWidget goals={widgetGoals} />

                    {/* Smart Insights */}
                    <InsightsWidget insights={insights} />

                    {/* Recent Transactions */}
                    <TransactionsWidget expenses={expenses} />

                    {/* Streak Widget */}
                    <StreakWidget
                        streak={streak}
                        weeklyPoints={weeklyStats.points}
                        weeklyChallenge={weeklyStats.challenge}
                        totalPoints={totalPoints}
                    />
                </div>
            </div>

            {/* ========== DESKTOP LAYOUT ========== */}
            <div className="hidden lg:block p-6">
                {/* Enhanced Header */}
                <div className="mb-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(), 'EEEE, MMMM d, yyyy')}
                            </p>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, {user?.displayName?.split(' ')[0] || 'there'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                {monthlyTotal === 0
                                    ? "Start tracking your expenses today! 🚀"
                                    : `You've spent ₹${monthlyTotal.toLocaleString('en-IN')} this month ✨`}
                            </p>
                        </div>
                    </div>
                </div>


                {/* Desktop Bento Grid - Tighter Layout */}
                <div className="grid grid-cols-12 gap-4">
                    {/* Row 1: Quick Actions (5) + Net Worth (4) + Goals (3) */}
                    <div className="col-span-5">
                        <QuickActionsWidget />
                    </div>
                    <div className="col-span-4">
                        <NetWorthWidget assets={widgetAssets} liabilities={widgetLiabilities} />
                    </div>
                    <div className="col-span-3">
                        <GoalsWidget goals={widgetGoals} />
                    </div>

                    {/* Row 2: Spending (5) + Bills (4) + Insights (3) */}
                    <div className="col-span-5">
                        <SpendingWidget
                            monthlyTotal={monthlyTotal}
                            budget={60000}
                            categoryTotals={categoryTotals}
                            transactionCount={expenses.length}
                        />
                    </div>
                    <div className="col-span-4">
                        <BillsWidget bills={widgetBills} />
                    </div>
                    <div className="col-span-3">
                        <InsightsWidget insights={insights} />
                    </div>

                    {/* Row 3: Transactions (8) + Streak (4) */}
                    <div className="col-span-8">
                        <TransactionsWidget expenses={expenses} />
                    </div>
                    <div className="col-span-4">
                        <StreakWidget
                            streak={streak}
                            weeklyPoints={weeklyStats.points}
                            weeklyChallenge={weeklyStats.challenge}
                            totalPoints={totalPoints}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
