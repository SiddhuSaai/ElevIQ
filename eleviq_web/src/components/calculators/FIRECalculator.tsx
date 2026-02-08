'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Flame, Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { SliderInput, ProgressGauge, GrowthChart, AIInsights } from './shared';

interface FIRECalculatorProps {
    onBack?: () => void;
}

// Helper function - defined outside component to avoid initialization issues
const formatCurrencyFIRE = (value: number) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(2)}Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(2)}L`;
    return value.toLocaleString();
};

export function FIRECalculator({ onBack }: FIRECalculatorProps) {
    const [currentAge, setCurrentAge] = useState(30);
    const [targetAge, setTargetAge] = useState(45);
    const [monthlyExpenses, setMonthlyExpenses] = useState(75000);
    const [currentSavings, setCurrentSavings] = useState(4500000);
    const [monthlyInvestment, setMonthlyInvestment] = useState(100000);
    const [expectedReturn, setExpectedReturn] = useState(12);
    const [inflationRate, setInflationRate] = useState(6);
    const [withdrawalRate, setWithdrawalRate] = useState(4);

    // FIRE calculations
    const result = useMemo(() => {
        const yearsToFIRE = targetAge - currentAge;
        const annualExpenses = monthlyExpenses * 12;

        // Future annual expenses (adjusted for inflation)
        const futureAnnualExpenses = annualExpenses * Math.pow(1 + inflationRate / 100, yearsToFIRE);

        // FIRE Number (corpus needed based on withdrawal rate)
        const fireNumber = futureAnnualExpenses / (withdrawalRate / 100);

        // Calculate projected corpus
        const r = expectedReturn / 12 / 100;
        const n = yearsToFIRE * 12;

        // Future value of current savings
        const fvCurrentSavings = currentSavings * Math.pow(1 + expectedReturn / 100, yearsToFIRE);

        // Future value of monthly investments (SIP)
        const fvInvestments = monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);

        const projectedCorpus = fvCurrentSavings + fvInvestments;

        // Calculate the age when FIRE is achieved
        let fireAge = targetAge;
        let yearlyCorpus = currentSavings;
        const yearlyInvestment = monthlyInvestment * 12;

        for (let age = currentAge; age <= 70; age++) {
            if (yearlyCorpus >= fireNumber) {
                fireAge = age;
                break;
            }
            yearlyCorpus = yearlyCorpus * (1 + expectedReturn / 100) + yearlyInvestment;
        }

        const isOnTrack = projectedCorpus >= fireNumber;
        const gap = fireNumber - projectedCorpus;
        const progressPercent = (projectedCorpus / fireNumber) * 100;

        // Required monthly investment to meet target
        const requiredMonthly = gap > 0
            ? (gap * r) / ((Math.pow(1 + r, n) - 1) * (1 + r))
            : 0;

        return {
            fireNumber,
            projectedCorpus,
            isOnTrack,
            gap,
            progressPercent,
            fireAge,
            requiredMonthly,
            fvCurrentSavings,
            fvInvestments,
            futureAnnualExpenses,
        };
    }, [currentAge, targetAge, monthlyExpenses, currentSavings, monthlyInvestment, expectedReturn, inflationRate, withdrawalRate]);

    // Generate yearly projection data
    const yearlyData = useMemo(() => {
        const data = [];
        let corpus = currentSavings;

        for (let year = 0; year <= targetAge - currentAge; year++) {
            data.push({
                year,
                value: corpus,
            });
            corpus = corpus * (1 + expectedReturn / 100) + monthlyInvestment * 12;
        }

        return data;
    }, [currentAge, targetAge, currentSavings, monthlyInvestment, expectedReturn]);

    // AI insights
    const insights = useMemo(() => {
        const tips: { type: 'tip' | 'warning' | 'goal'; title: string; message: string }[] = [];

        if (!result.isOnTrack) {
            tips.push({
                type: 'warning',
                title: 'Gap to Target',
                message: `You're ₹${formatCurrencyFIRE(result.gap)} short. Increase SIP by ₹${formatCurrencyFIRE(result.requiredMonthly)}/month to meet your goal.`,
            });
        } else {
            tips.push({
                type: 'goal',
                title: 'On Track! 🎉',
                message: `You'll achieve FIRE by age ${result.fireAge}. Keep up your investment discipline!`,
            });
        }

        // Expense reduction tip
        const reducedExpenses = monthlyExpenses * 0.9;
        const reducedFireNumber = (reducedExpenses * 12 * Math.pow(1 + inflationRate / 100, targetAge - currentAge)) / (withdrawalRate / 100);
        const savings = result.fireNumber - reducedFireNumber;

        tips.push({
            type: 'tip',
            title: 'Reduce Expenses by 10%',
            message: `Lowering expenses to ₹${reducedExpenses.toLocaleString()}/month reduces your FIRE number by ₹${formatCurrencyFIRE(savings)}`,
        });

        // Earlier start
        tips.push({
            type: 'tip',
            title: 'Power of Starting Early',
            message: `Starting 5 years earlier with the same SIP would have given you ₹${formatCurrencyFIRE(result.fvInvestments * 0.6)} extra through compounding!`,
        });

        return tips;
    }, [result, monthlyExpenses, inflationRate, targetAge, currentAge, withdrawalRate]);

    // Use the helper function
    const formatCurrency = formatCurrencyFIRE;

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

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Flame className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">FIRE Calculator</h2>
                </div>
                <p className="text-orange-100">Financial Independence, Retire Early - Plan your path to freedom</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Your Profile</h3>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <SliderInput
                                    label="Current Age"
                                    value={currentAge}
                                    onChange={setCurrentAge}
                                    min={18}
                                    max={60}
                                    step={1}
                                    suffix=" yrs"
                                />
                                <SliderInput
                                    label="Target Retire Age"
                                    value={targetAge}
                                    onChange={setTargetAge}
                                    min={currentAge + 1}
                                    max={70}
                                    step={1}
                                    suffix=" yrs"
                                />
                            </div>

                            <SliderInput
                                label="Monthly Expenses"
                                value={monthlyExpenses}
                                onChange={setMonthlyExpenses}
                                min={10000}
                                max={500000}
                                step={5000}
                                prefix="₹"
                                formatValue={(v) => v.toLocaleString()}
                                quickValues={[25000, 50000, 75000, 100000, 150000]}
                            />

                            <SliderInput
                                label="Current Savings/Investments"
                                value={currentSavings}
                                onChange={setCurrentSavings}
                                min={0}
                                max={50000000}
                                step={100000}
                                prefix="₹"
                                formatValue={formatCurrency}
                                quickValues={[1000000, 2500000, 5000000, 10000000]}
                            />

                            <SliderInput
                                label="Monthly Investment"
                                value={monthlyInvestment}
                                onChange={setMonthlyInvestment}
                                min={5000}
                                max={500000}
                                step={5000}
                                prefix="₹"
                                formatValue={(v) => v.toLocaleString()}
                                quickValues={[25000, 50000, 100000, 150000, 200000]}
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Assumptions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <SliderInput
                                label="Expected Return"
                                value={expectedReturn}
                                onChange={setExpectedReturn}
                                min={6}
                                max={18}
                                step={0.5}
                                suffix="% p.a."
                            />
                            <SliderInput
                                label="Inflation Rate"
                                value={inflationRate}
                                onChange={setInflationRate}
                                min={3}
                                max={10}
                                step={0.5}
                                suffix="% p.a."
                            />
                            <SliderInput
                                label="Safe Withdrawal Rate"
                                value={withdrawalRate}
                                onChange={setWithdrawalRate}
                                min={2}
                                max={6}
                                step={0.5}
                                suffix="%"
                            />
                        </div>
                    </div>

                    {/* AI Insights */}
                    <AIInsights insights={insights} />
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {/* Progress Gauge */}
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                            FIRE Progress
                        </h3>
                        <div className="flex justify-center mb-4">
                            <ProgressGauge
                                value={result.progressPercent}
                                max={100}
                                label={result.isOnTrack ? 'On Track!' : 'Need More'}
                                sublabel={`Age ${result.fireAge}`}
                                color={result.isOnTrack ? '#22c55e' : '#f59e0b'}
                            />
                        </div>
                        <div className={`text-center p-3 rounded-xl ${result.isOnTrack
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                            }`}>
                            {result.isOnTrack ? (
                                <div className="flex items-center justify-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium">FIRE achievable by age {result.fireAge}!</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span className="font-medium">You'll reach FIRE at age {result.fireAge}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Key Numbers */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4" />
                                <p className="text-orange-100 text-xs">FIRE Number</p>
                            </div>
                            <p className="text-2xl font-bold">₹{formatCurrency(result.fireNumber)}</p>
                            <p className="text-xs text-orange-100 mt-1">25x annual expenses</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-4 text-white"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4" />
                                <p className="text-blue-100 text-xs">Projected Corpus</p>
                            </div>
                            <p className="text-2xl font-bold">₹{formatCurrency(result.projectedCorpus)}</p>
                            <p className="text-xs text-blue-100 mt-1">At age {targetAge}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-[#171717] rounded-xl p-4 border border-gray-100 dark:border-white/5"
                        >
                            <p className="text-gray-500 text-xs mb-1">Current Savings</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">₹{formatCurrency(currentSavings)}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-[#171717] rounded-xl p-4 border border-gray-100 dark:border-white/5"
                        >
                            <p className="text-gray-500 text-xs mb-1">Gap to Target</p>
                            <p className={`text-xl font-bold ${result.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {result.gap > 0 ? `₹${formatCurrency(result.gap)}` : '✓ Surplus'}
                            </p>
                        </motion.div>
                    </div>

                    {/* Growth Chart */}
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Path to FIRE
                        </h3>
                        <GrowthChart
                            data={yearlyData}
                            height={200}
                            formatValue={(v) => `₹${formatCurrency(v)}`}
                        />
                        {/* FIRE Line Indicator */}
                        <div className="mt-4 flex items-center gap-2 justify-center">
                            <div className="w-8 h-0.5 bg-orange-500 border-dashed" />
                            <span className="text-xs text-gray-500">FIRE Target: ₹{formatCurrency(result.fireNumber)}</span>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Corpus Breakdown at Age {targetAge}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">From Current Savings</span>
                                <span className="font-medium text-gray-900 dark:text-white">₹{formatCurrency(result.fvCurrentSavings)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">From Monthly SIP</span>
                                <span className="font-medium text-gray-900 dark:text-white">₹{formatCurrency(result.fvInvestments)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-white/5">
                                <span className="font-medium text-gray-900 dark:text-white">Total Corpus</span>
                                <span className="font-bold text-blue-600">₹{formatCurrency(result.projectedCorpus)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
