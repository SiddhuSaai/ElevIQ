'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Flame, TrendingUp } from 'lucide-react';
import { SliderInput, ProgressGauge, GrowthChart, AIInsights } from './shared';

interface RetirementCorpusCalculatorProps {
    onBack?: () => void;
}

export function RetirementCorpusCalculator({ onBack }: RetirementCorpusCalculatorProps) {
    const [currentAge, setCurrentAge] = useState(30);
    const [retirementAge, setRetirementAge] = useState(60);
    const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
    const [currentSavings, setCurrentSavings] = useState(500000);
    const [expectedReturn, setExpectedReturn] = useState(12);
    const [inflationRate, setInflationRate] = useState(6);
    const [lifeExpectancy, setLifeExpectancy] = useState(85);

    const result = useMemo(() => {
        const yearsToRetirement = retirementAge - currentAge;
        const yearsInRetirement = lifeExpectancy - retirementAge;

        // Future monthly expenses at retirement (inflation adjusted)
        const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);

        // Required corpus for retirement (using 4% rule variant)
        const realReturnInRetirement = (expectedReturn - inflationRate) / 100;
        const annualExpensesAtRetirement = futureMonthlyExpenses * 12;

        // Present value of retirement expenses
        const requiredCorpus = annualExpensesAtRetirement *
            ((1 - Math.pow(1 + realReturnInRetirement, -yearsInRetirement)) / realReturnInRetirement);

        // Future value of current savings
        const fvCurrentSavings = currentSavings * Math.pow(1 + expectedReturn / 100, yearsToRetirement);

        // Gap to fill
        const gap = requiredCorpus - fvCurrentSavings;

        // Monthly SIP required
        const r = expectedReturn / 12 / 100;
        const n = yearsToRetirement * 12;
        const monthlySIP = gap > 0
            ? (gap * r) / ((Math.pow(1 + r, n) - 1) * (1 + r))
            : 0;

        const progress = Math.min(100, (fvCurrentSavings / requiredCorpus) * 100);

        return {
            requiredCorpus,
            fvCurrentSavings,
            gap: Math.max(0, gap),
            monthlySIP: Math.max(0, monthlySIP),
            futureMonthlyExpenses,
            progress,
            yearsToRetirement,
        };
    }, [currentAge, retirementAge, monthlyExpenses, currentSavings, expectedReturn, inflationRate, lifeExpectancy]);

    const yearlyData = useMemo(() => {
        const data = [];
        let savings = currentSavings;
        const monthlyContribution = result.monthlySIP;

        for (let year = 0; year <= result.yearsToRetirement; year++) {
            data.push({ year, value: savings });
            savings = savings * (1 + expectedReturn / 100) + (monthlyContribution * 12);
        }
        return data;
    }, [currentSavings, result.yearsToRetirement, expectedReturn, result.monthlySIP]);

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
        if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
        return `₹${value.toLocaleString()}`;
    };

    const insights = useMemo(() => {
        const tips: { type: 'tip' | 'warning' | 'goal'; title: string; message: string }[] = [];

        tips.push({
            type: 'goal',
            title: 'Retirement Corpus',
            message: `You need ${formatCurrency(result.requiredCorpus)} for a comfortable retirement at age ${retirementAge}.`,
        });

        tips.push({
            type: 'tip',
            title: 'Monthly Investment',
            message: `Invest ${formatCurrency(result.monthlySIP)}/month to meet your retirement goal.`,
        });

        if (result.progress < 50) {
            tips.push({
                type: 'warning',
                title: 'Start Now',
                message: 'The earlier you start, the less you need to invest monthly due to compounding.',
            });
        }

        return tips;
    }, [result, retirementAge]);

    return (
        <div className="space-y-6">
            {onBack && (
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to calculators</span>
                </button>
            )}

            <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Flame className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Retirement Corpus</h2>
                </div>
                <p className="text-red-100">Calculate how much you need for a worry-free retirement</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Your Profile</h3>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <SliderInput
                                    label="Current Age"
                                    value={currentAge}
                                    onChange={setCurrentAge}
                                    min={20}
                                    max={55}
                                    step={1}
                                    suffix=" yrs"
                                />
                                <SliderInput
                                    label="Retire At"
                                    value={retirementAge}
                                    onChange={setRetirementAge}
                                    min={currentAge + 5}
                                    max={70}
                                    step={1}
                                    suffix=" yrs"
                                />
                            </div>
                            <SliderInput
                                label="Monthly Expenses"
                                value={monthlyExpenses}
                                onChange={setMonthlyExpenses}
                                min={20000}
                                max={500000}
                                step={5000}
                                prefix="₹"
                                quickValues={[30000, 50000, 75000, 100000]}
                            />
                            <SliderInput
                                label="Current Savings"
                                value={currentSavings}
                                onChange={setCurrentSavings}
                                min={0}
                                max={50000000}
                                step={100000}
                                prefix="₹"
                                formatValue={(v) => formatCurrency(v)}
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Assumptions</h3>
                        <div className="space-y-6">
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
                                    label="Inflation"
                                    value={inflationRate}
                                    onChange={setInflationRate}
                                    min={3}
                                    max={10}
                                    step={0.5}
                                    suffix="% p.a."
                                />
                            </div>
                            <SliderInput
                                label="Life Expectancy"
                                value={lifeExpectancy}
                                onChange={setLifeExpectancy}
                                min={70}
                                max={100}
                                step={1}
                                suffix=" yrs"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Retirement Plan</h3>

                        <div className="flex justify-center mb-6">
                            <ProgressGauge value={result.progress} max={100} label="Progress" />
                        </div>

                        <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-xl p-6 text-center mb-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Corpus Required</p>
                            <p className="text-4xl font-bold text-red-600">{formatCurrency(result.requiredCorpus)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Future expenses: {formatCurrency(result.futureMonthlyExpenses)}/month
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Monthly SIP</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(result.monthlySIP)}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Gap to Fill</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(result.gap)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Projected Growth</h3>
                        <GrowthChart data={yearlyData} />
                    </div>

                    <AIInsights insights={insights} />
                </div>
            </div>
        </div>
    );
}
