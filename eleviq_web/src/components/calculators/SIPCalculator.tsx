'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Home, Car, GraduationCap, Plane, Wallet, TrendingUp, ArrowLeft, Download, Share2 } from 'lucide-react';
import { SliderInput, PieChart, GrowthChart, ProgressGauge, AIInsights, generateSIPInsights } from './shared';

interface SIPCalculatorProps {
    onBack?: () => void;
}

const goals = [
    { id: 'house', name: 'House', icon: Home, color: '#3b82f6' },
    { id: 'car', name: 'Car', icon: Car, color: '#10b981' },
    { id: 'education', name: 'Education', icon: GraduationCap, color: '#8b5cf6' },
    { id: 'vacation', name: 'Vacation', icon: Plane, color: '#f59e0b' },
    { id: 'custom', name: 'Custom', icon: Wallet, color: '#ec4899' },
];

const riskProfiles = [
    { id: 'conservative', name: 'Conservative', rate: 8, description: 'Debt funds, FDs' },
    { id: 'moderate', name: 'Moderate', rate: 12, description: 'Balanced funds' },
    { id: 'aggressive', name: 'Aggressive', rate: 15, description: 'Equity funds' },
];

export function SIPCalculator({ onBack }: SIPCalculatorProps) {
    const [monthly, setMonthly] = useState(10000);
    const [years, setYears] = useState(15);
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
    const [targetAmount, setTargetAmount] = useState(5000000);
    const [selectedRisk, setSelectedRisk] = useState('moderate');
    const [stepUpEnabled, setStepUpEnabled] = useState(false);
    const [stepUpPercent, setStepUpPercent] = useState(10);

    const rate = riskProfiles.find((r) => r.id === selectedRisk)?.rate || 12;

    // Calculate SIP results
    const result = useMemo(() => {
        if (!monthly || !years) return null;

        const r = rate / 12 / 100;
        const n = years * 12;

        let futureValue: number;
        let totalInvested: number;

        if (stepUpEnabled) {
            // Step-up SIP calculation
            futureValue = 0;
            totalInvested = 0;
            let currentMonthly = monthly;

            for (let year = 1; year <= years; year++) {
                const yearlyInvested = currentMonthly * 12;
                totalInvested += yearlyInvested;

                // Future value of this year's investment
                const yearsRemaining = years - year;
                const monthsRemaining = yearsRemaining * 12 + 6; // Average 6 months for the year
                const fv = currentMonthly * ((Math.pow(1 + r, 12) - 1) / r) * (1 + r);
                futureValue += fv * Math.pow(1 + rate / 100, yearsRemaining);

                currentMonthly *= (1 + stepUpPercent / 100);
            }
        } else {
            futureValue = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
            totalInvested = monthly * n;
        }

        const earnings = futureValue - totalInvested;
        const growthMultiple = futureValue / totalInvested;

        return { futureValue, invested: totalInvested, earnings, growthMultiple };
    }, [monthly, rate, years, stepUpEnabled, stepUpPercent]);

    // Generate yearly data for chart
    const yearlyData = useMemo(() => {
        if (!result) return [];

        const data = [];
        const r = rate / 12 / 100;

        for (let year = 0; year <= years; year++) {
            const n = year * 12;
            let value: number;
            let invested: number;

            if (stepUpEnabled) {
                value = 0;
                invested = 0;
                let currentMonthly = monthly;

                for (let y = 1; y <= year; y++) {
                    invested += currentMonthly * 12;
                    const yearsRemaining = year - y;
                    const fv = currentMonthly * ((Math.pow(1 + r, 12) - 1) / r) * (1 + r);
                    value += fv * Math.pow(1 + rate / 100, yearsRemaining);
                    currentMonthly *= (1 + stepUpPercent / 100);
                }
            } else {
                value = year === 0 ? 0 : monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
                invested = monthly * n;
            }

            data.push({ year, value, invested });
        }

        return data;
    }, [monthly, rate, years, stepUpEnabled, stepUpPercent]);

    // Calculate milestones
    const milestones = useMemo(() => {
        const targets = [500000, 1000000, 2500000, 5000000, 10000000];
        return targets.map((target) => {
            const yearToReach = yearlyData.findIndex((d) => d.value >= target);
            return {
                amount: target,
                year: yearToReach > 0 ? yearToReach : null,
            };
        }).filter((m) => m.year !== null && m.year <= years);
    }, [yearlyData, years]);

    // AI Insights
    const insights = useMemo(() => {
        if (!result) return [];
        return generateSIPInsights(monthly, rate, years, result.invested, result.earnings, result.futureValue);
    }, [monthly, rate, years, result]);

    // Goal progress
    const goalProgress = result ? (result.futureValue / targetAmount) * 100 : 0;

    // Pie chart data
    const pieData = result ? [
        { label: 'Invested', value: result.invested, color: '#a855f7' },
        { label: 'Returns', value: result.earnings, color: '#22c55e' },
    ] : [];

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `${(value / 10000000).toFixed(2)}Cr`;
        if (value >= 100000) return `${(value / 100000).toFixed(2)}L`;
        return `₹${value.toLocaleString()}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to calculators</span>
                </button>
            )}

            {/* Goal Selection */}
            <div className="bg-white dark:bg-[#171717] rounded-2xl p-4 border border-gray-100 dark:border-white/5">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Investment Goal (Optional)</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {goals.map((goal) => {
                        const Icon = goal.icon;
                        const isSelected = selectedGoal === goal.id;
                        return (
                            <button
                                key={goal.id}
                                onClick={() => setSelectedGoal(isSelected ? null : goal.id)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all min-w-[80px] ${isSelected
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-white/10 hover:border-gray-300'
                                    }`}
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: `${goal.color}20` }}
                                >
                                    <Icon className="w-5 h-5" style={{ color: goal.color }} />
                                </div>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{goal.name}</span>
                            </button>
                        );
                    })}
                </div>

                {selectedGoal && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5"
                    >
                        <SliderInput
                            label="Target Amount"
                            value={targetAmount}
                            onChange={setTargetAmount}
                            min={100000}
                            max={50000000}
                            step={100000}
                            prefix="₹"
                            formatValue={formatCurrency}
                            quickValues={[1000000, 2500000, 5000000, 10000000]}
                        />
                    </motion.div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Investment Details</h3>

                        <div className="space-y-6">
                            <SliderInput
                                label="Monthly Investment"
                                value={monthly}
                                onChange={setMonthly}
                                min={500}
                                max={500000}
                                step={500}
                                prefix="₹"
                                formatValue={(v) => v.toLocaleString()}
                                quickValues={[5000, 10000, 25000, 50000, 100000]}
                            />

                            {/* Risk Profile */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Expected Return
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {riskProfiles.map((profile) => (
                                        <button
                                            key={profile.id}
                                            onClick={() => setSelectedRisk(profile.id)}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${selectedRisk === profile.id
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-200 dark:border-white/10 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <TrendingUp className={`w-4 h-4 ${selectedRisk === profile.id ? 'text-blue-600' : 'text-gray-400'
                                                    }`} />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {profile.rate}%
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">{profile.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <SliderInput
                                label="Time Period"
                                value={years}
                                onChange={setYears}
                                min={1}
                                max={40}
                                step={1}
                                suffix=" Years"
                                quickValues={[5, 10, 15, 20, 25, 30]}
                            />

                            {/* Step-up Option */}
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-xl">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <span className="font-medium text-gray-900 dark:text-white">Step-up SIP</span>
                                        <p className="text-xs text-gray-500 mt-0.5">Increase SIP annually</p>
                                    </div>
                                    <button
                                        onClick={() => setStepUpEnabled(!stepUpEnabled)}
                                        className={`w-12 h-6 rounded-full transition-colors ${stepUpEnabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                                            }`}
                                    >
                                        <motion.div
                                            className="w-5 h-5 bg-white rounded-full shadow-sm"
                                            animate={{ x: stepUpEnabled ? 26 : 2 }}
                                        />
                                    </button>
                                </div>
                                {stepUpEnabled && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                    >
                                        <SliderInput
                                            label="Annual Increase"
                                            value={stepUpPercent}
                                            onChange={setStepUpPercent}
                                            min={5}
                                            max={25}
                                            step={1}
                                            suffix="%"
                                            quickValues={[5, 10, 15, 20]}
                                        />
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Results Cards */}
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-2 gap-3"
                        >
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                                <p className="text-purple-100 text-xs mb-1">Total Invested</p>
                                <p className="text-xl font-bold">{formatCurrency(result.invested)}</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                                <p className="text-green-100 text-xs mb-1">Est. Returns</p>
                                <p className="text-xl font-bold">{formatCurrency(result.earnings)}</p>
                            </div>
                            <div className="col-span-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-blue-100 text-xs mb-1">Total Value</p>
                                        <p className="text-2xl font-bold">{formatCurrency(result.futureValue)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-blue-100 text-xs mb-1">Growth</p>
                                        <p className="text-lg font-bold">{result.growthMultiple.toFixed(1)}x</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* AI Insights */}
                    <AIInsights insights={insights} />
                </div>

                {/* Visualization Section */}
                <div className="space-y-6">
                    {/* Goal Progress Gauge */}
                    {selectedGoal && result && (
                        <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                                Goal Progress
                            </h3>
                            <div className="flex justify-center">
                                <ProgressGauge
                                    value={result.futureValue}
                                    max={targetAmount}
                                    label={goalProgress >= 100 ? '🎉 Goal Achieved!' : `Target: ${formatCurrency(targetAmount)}`}
                                    sublabel={goalProgress >= 100 ? undefined : `${Math.round(goalProgress)}% complete`}
                                    color={goalProgress >= 100 ? '#22c55e' : '#3b82f6'}
                                />
                            </div>
                        </div>
                    )}

                    {/* Pie Chart */}
                    {result && (
                        <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Investment Breakdown
                            </h3>
                            <PieChart data={pieData} size={200} />
                        </div>
                    )}

                    {/* Wealth Growth Chart */}
                    {yearlyData.length > 0 && (
                        <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Wealth Growth Over Time
                            </h3>
                            <GrowthChart
                                data={yearlyData}
                                height={200}
                                formatValue={(v) => formatCurrency(v)}
                            />
                        </div>
                    )}

                    {/* Milestones */}
                    {milestones.length > 0 && (
                        <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                🎯 Milestone Tracker
                            </h3>
                            <div className="space-y-3">
                                {milestones.map((milestone, index) => (
                                    <motion.div
                                        key={milestone.amount}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="w-20 text-right">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatCurrency(milestone.amount)}
                                            </span>
                                        </div>
                                        <div className="flex-1 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(milestone.year! / years) * 100}%` }}
                                                transition={{ delay: 0.5, duration: 0.5 }}
                                            />
                                        </div>
                                        <div className="w-16">
                                            <span className="text-sm text-gray-500">Year {milestone.year}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Download</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Share</span>
                </button>
            </div>
        </div>
    );
}
