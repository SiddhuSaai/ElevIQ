'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Calendar, TrendingUp } from 'lucide-react';
import { SliderInput, ProgressGauge, GrowthChart, AIInsights } from './shared';

interface GoalPlannerProps {
    onBack?: () => void;
}

const goals = [
    { id: 'house', name: 'Dream Home', icon: '🏠', defaultAmount: 10000000 },
    { id: 'car', name: 'New Car', icon: '🚗', defaultAmount: 1500000 },
    { id: 'education', name: 'Education', icon: '🎓', defaultAmount: 3000000 },
    { id: 'wedding', name: 'Wedding', icon: '💒', defaultAmount: 2000000 },
    { id: 'vacation', name: 'Vacation', icon: '✈️', defaultAmount: 500000 },
    { id: 'custom', name: 'Custom Goal', icon: '🎯', defaultAmount: 1000000 },
];

export function GoalPlanner({ onBack }: GoalPlannerProps) {
    const [selectedGoal, setSelectedGoal] = useState('house');
    const [targetAmount, setTargetAmount] = useState(10000000);
    const [targetYears, setTargetYears] = useState(10);
    const [currentSavings, setCurrentSavings] = useState(500000);
    const [expectedReturn, setExpectedReturn] = useState(12);

    const result = useMemo(() => {
        const r = expectedReturn / 12 / 100;
        const n = targetYears * 12;

        // Future value of current savings
        const fvCurrentSavings = currentSavings * Math.pow(1 + expectedReturn / 100, targetYears);

        // Required corpus from SIP
        const requiredFromSIP = targetAmount - fvCurrentSavings;

        // Monthly SIP needed
        const monthlySIP = requiredFromSIP > 0
            ? (requiredFromSIP * r) / ((Math.pow(1 + r, n) - 1) * (1 + r))
            : 0;

        // Progress percentage
        const progress = Math.min(100, (fvCurrentSavings / targetAmount) * 100);

        return {
            monthlySIP: Math.max(0, monthlySIP),
            fvCurrentSavings,
            progress,
            requiredFromSIP: Math.max(0, requiredFromSIP),
            totalInvestment: currentSavings + (monthlySIP * n),
        };
    }, [targetAmount, targetYears, currentSavings, expectedReturn]);

    const yearlyData = useMemo(() => {
        const data = [];
        let savings = currentSavings;
        const monthlySIP = result.monthlySIP;

        for (let year = 0; year <= targetYears; year++) {
            data.push({ year, value: savings });
            savings = savings * (1 + expectedReturn / 100) + (monthlySIP * 12);
        }
        return data;
    }, [currentSavings, targetYears, expectedReturn, result.monthlySIP]);

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
        if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
        return `₹${value.toLocaleString()}`;
    };

    const insights = useMemo(() => {
        const tips: { type: 'tip' | 'warning' | 'goal'; title: string; message: string }[] = [];

        if (result.progress >= 50) {
            tips.push({
                type: 'goal',
                title: 'Great Progress!',
                message: `Your current savings already cover ${result.progress.toFixed(0)}% of your goal!`,
            });
        }

        tips.push({
            type: 'tip',
            title: 'Monthly Commitment',
            message: `Invest ${formatCurrency(result.monthlySIP)}/month to reach ${formatCurrency(targetAmount)} in ${targetYears} years.`,
        });

        if (result.monthlySIP > 50000) {
            tips.push({
                type: 'warning',
                title: 'High SIP Needed',
                message: 'Consider extending your timeline or increasing initial savings to reduce monthly commitment.',
            });
        }

        return tips;
    }, [result, targetAmount, targetYears]);

    return (
        <div className="space-y-6">
            {onBack && (
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to calculators</span>
                </button>
            )}

            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Target className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Goal Planner</h2>
                </div>
                <p className="text-teal-100">Plan investments to achieve your financial goals</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Your Goal</h3>
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {goals.map((goal) => (
                                <button
                                    key={goal.id}
                                    onClick={() => {
                                        setSelectedGoal(goal.id);
                                        setTargetAmount(goal.defaultAmount);
                                    }}
                                    className={`p-4 rounded-xl border-2 transition-all text-center ${selectedGoal === goal.id
                                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-500/10'
                                        : 'border-gray-100 dark:border-white/10 hover:border-gray-200'
                                        }`}
                                >
                                    <span className="text-2xl">{goal.icon}</span>
                                    <p className="text-sm font-medium mt-1 text-gray-900 dark:text-white">{goal.name}</p>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <SliderInput
                                label="Target Amount"
                                value={targetAmount}
                                onChange={setTargetAmount}
                                min={100000}
                                max={100000000}
                                step={100000}
                                prefix="₹"
                                formatValue={(v) => formatCurrency(v)}
                            />
                            <SliderInput
                                label="Target Years"
                                value={targetYears}
                                onChange={setTargetYears}
                                min={1}
                                max={30}
                                step={1}
                                suffix=" yrs"
                                quickValues={[5, 10, 15, 20]}
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Your Current Position</h3>
                        <div className="space-y-6">
                            <SliderInput
                                label="Current Savings"
                                value={currentSavings}
                                onChange={setCurrentSavings}
                                min={0}
                                max={targetAmount * 0.5}
                                step={10000}
                                prefix="₹"
                                formatValue={(v) => formatCurrency(v)}
                            />
                            <SliderInput
                                label="Expected Return"
                                value={expectedReturn}
                                onChange={setExpectedReturn}
                                min={6}
                                max={20}
                                step={0.5}
                                suffix="% p.a."
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Plan</h3>

                        <div className="flex justify-center mb-6">
                            <ProgressGauge value={result.progress} max={100} label="Goal Progress" />
                        </div>

                        <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-xl p-6 text-center mb-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Required Monthly SIP</p>
                            <p className="text-4xl font-bold text-teal-600">{formatCurrency(result.monthlySIP)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">for {targetYears} years</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Current Savings FV</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(result.fvCurrentSavings)}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">From SIP</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(result.requiredFromSIP)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Projection</h3>
                        <GrowthChart data={yearlyData} />
                    </div>

                    <AIInsights insights={insights} />
                </div>
            </div>
        </div>
    );
}
