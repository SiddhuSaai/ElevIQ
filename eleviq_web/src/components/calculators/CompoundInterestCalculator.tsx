'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, PiggyBank, TrendingUp } from 'lucide-react';
import { SliderInput, PieChart, GrowthChart, AIInsights } from './shared';

interface CompoundInterestCalculatorProps {
    onBack?: () => void;
}

export function CompoundInterestCalculator({ onBack }: CompoundInterestCalculatorProps) {
    const [principal, setPrincipal] = useState(100000);
    const [rate, setRate] = useState(10);
    const [timePeriod, setTimePeriod] = useState(10);
    const [compoundingFrequency, setCompoundingFrequency] = useState<'yearly' | 'half-yearly' | 'quarterly' | 'monthly'>('yearly');

    const frequencyMap = { yearly: 1, 'half-yearly': 2, quarterly: 4, monthly: 12 };

    const result = useMemo(() => {
        const n = frequencyMap[compoundingFrequency];
        const amount = principal * Math.pow(1 + rate / 100 / n, n * timePeriod);
        const interest = amount - principal;

        // Simple interest for comparison
        const simpleInterest = principal * rate / 100 * timePeriod;
        const compoundBenefit = interest - simpleInterest;

        return {
            amount,
            interest,
            principal,
            simpleInterest,
            compoundBenefit,
        };
    }, [principal, rate, timePeriod, compoundingFrequency]);

    const yearlyData = useMemo(() => {
        const data = [];
        const n = frequencyMap[compoundingFrequency];
        for (let year = 0; year <= timePeriod; year++) {
            data.push({
                year,
                value: principal * Math.pow(1 + rate / 100 / n, n * year),
            });
        }
        return data;
    }, [principal, rate, timePeriod, compoundingFrequency]);

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
        if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
        return `₹${value.toLocaleString()}`;
    };

    const pieData = [
        { label: 'Principal', value: result.principal, color: '#6366f1' },
        { label: 'Interest', value: result.interest, color: '#10b981' },
    ];

    const insights = useMemo(() => {
        const tips: { type: 'tip' | 'warning' | 'goal'; title: string; message: string }[] = [];

        tips.push({
            type: 'goal',
            title: 'Power of Compounding',
            message: `You earn ${formatCurrency(result.compoundBenefit)} extra through compound interest vs simple interest!`,
        });

        if (compoundingFrequency !== 'monthly') {
            const monthlyAmount = principal * Math.pow(1 + rate / 100 / 12, 12 * timePeriod);
            const monthlyExtra = monthlyAmount - result.amount;
            tips.push({
                type: 'tip',
                title: 'Monthly Compounding',
                message: `Monthly compounding would give you ${formatCurrency(monthlyExtra)} more.`,
            });
        }

        tips.push({
            type: 'tip',
            title: 'Double Your Money',
            message: `At ${rate}% returns, your money doubles in ~${Math.round(72 / rate)} years (Rule of 72).`,
        });

        return tips;
    }, [result, principal, rate, timePeriod, compoundingFrequency]);

    return (
        <div className="space-y-6">
            {onBack && (
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to calculators</span>
                </button>
            )}

            <div className="bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <PiggyBank className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Compound Interest</h2>
                </div>
                <p className="text-purple-100">Experience the power of compound growth</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Investment Details</h3>
                        <div className="space-y-6">
                            <SliderInput
                                label="Principal Amount"
                                value={principal}
                                onChange={setPrincipal}
                                min={1000}
                                max={10000000}
                                step={1000}
                                prefix="₹"
                                formatValue={(v) => formatCurrency(v)}
                                quickValues={[100000, 500000, 1000000, 2500000]}
                            />
                            <SliderInput
                                label="Interest Rate"
                                value={rate}
                                onChange={setRate}
                                min={1}
                                max={25}
                                step={0.5}
                                suffix="% p.a."
                            />
                            <SliderInput
                                label="Time Period"
                                value={timePeriod}
                                onChange={setTimePeriod}
                                min={1}
                                max={30}
                                step={1}
                                suffix=" yrs"
                                quickValues={[5, 10, 15, 20]}
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compounding Frequency</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {(['yearly', 'half-yearly', 'quarterly', 'monthly'] as const).map((freq) => (
                                <button
                                    key={freq}
                                    onClick={() => setCompoundingFrequency(freq)}
                                    className={`p-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${compoundingFrequency === freq
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600'
                                            : 'border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-200'
                                        }`}
                                >
                                    {freq}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Returns</h3>

                        <div className="text-center p-6 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-xl mb-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white">{formatCurrency(result.amount)}</p>
                            <p className="text-sm text-green-600 mt-1">Interest: +{formatCurrency(result.interest)}</p>
                        </div>

                        <PieChart data={pieData} size={180} />
                    </div>

                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Growth Chart</h3>
                        <GrowthChart data={yearlyData} />
                    </div>

                    <AIInsights insights={insights} />
                </div>
            </div>
        </div>
    );
}
