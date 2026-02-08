'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Wallet } from 'lucide-react';
import { SliderInput, PieChart, GrowthChart, AIInsights } from './shared';

interface RDCalculatorProps {
    onBack?: () => void;
}

export function RDCalculator({ onBack }: RDCalculatorProps) {
    const [monthlyDeposit, setMonthlyDeposit] = useState(10000);
    const [interestRate, setInterestRate] = useState(7);
    const [tenure, setTenure] = useState(5);

    const result = useMemo(() => {
        const r = interestRate / 100 / 4; // Quarterly compounding
        const n = tenure * 12;

        // RD formula: P * [(1+r)^n - 1] / (1 - (1+r)^(-1/3))
        const maturityAmount = monthlyDeposit * ((Math.pow(1 + r, n / 3) - 1) / (1 - Math.pow(1 + r, -1 / 3)));
        const totalDeposit = monthlyDeposit * n;
        const interest = maturityAmount - totalDeposit;

        return {
            maturityAmount,
            interest,
            totalDeposit,
            monthsToMature: n,
        };
    }, [monthlyDeposit, interestRate, tenure]);

    const yearlyData = useMemo(() => {
        const data = [];
        let deposited = 0;
        const r = interestRate / 100 / 4;

        for (let month = 0; month <= tenure * 12; month += 12) {
            deposited = monthlyDeposit * month;
            const value = monthlyDeposit * ((Math.pow(1 + r, month / 3) - 1) / (1 - Math.pow(1 + r, -1 / 3)));
            data.push({ year: month / 12, value: Math.max(deposited, value) });
        }
        return data;
    }, [monthlyDeposit, interestRate, tenure]);

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
        if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
        return `₹${value.toLocaleString()}`;
    };

    const pieData = [
        { label: 'Total Deposit', value: result.totalDeposit, color: '#8b5cf6' },
        { label: 'Interest', value: result.interest, color: '#10b981' },
    ];

    const insights = useMemo(() => {
        const tips: { type: 'tip' | 'warning' | 'goal'; title: string; message: string }[] = [];

        tips.push({
            type: 'goal',
            title: 'Total Savings',
            message: `You'll save ${formatCurrency(result.totalDeposit)} and earn ${formatCurrency(result.interest)} interest.`,
        });

        tips.push({
            type: 'tip',
            title: 'Build Discipline',
            message: 'RD helps build saving discipline with fixed monthly commitments.',
        });

        if (interestRate < 7) {
            tips.push({
                type: 'warning',
                title: 'Low Returns',
                message: 'Consider SIP in debt funds for potentially better post-tax returns.',
            });
        }

        return tips;
    }, [result, interestRate]);

    return (
        <div className="space-y-6">
            {onBack && (
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to calculators</span>
                </button>
            )}

            <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Wallet className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">RD Calculator</h2>
                </div>
                <p className="text-violet-100">Calculate Recurring Deposit returns</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">RD Details</h3>
                        <div className="space-y-6">
                            <SliderInput
                                label="Monthly Deposit"
                                value={monthlyDeposit}
                                onChange={setMonthlyDeposit}
                                min={500}
                                max={100000}
                                step={500}
                                prefix="₹"
                                quickValues={[5000, 10000, 25000, 50000]}
                            />
                            <SliderInput
                                label="Interest Rate"
                                value={interestRate}
                                onChange={setInterestRate}
                                min={3}
                                max={10}
                                step={0.1}
                                suffix="% p.a."
                            />
                            <SliderInput
                                label="Tenure"
                                value={tenure}
                                onChange={setTenure}
                                min={1}
                                max={10}
                                step={1}
                                suffix=" yrs"
                                quickValues={[1, 2, 3, 5]}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Maturity Details</h3>

                        <div className="text-center p-6 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl mb-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Maturity Amount</p>
                            <p className="text-4xl font-bold text-violet-600">{formatCurrency(result.maturityAmount)}</p>
                            <p className="text-sm text-green-600 mt-1">+{formatCurrency(result.interest)} interest</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Deposit</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(result.totalDeposit)}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{result.monthsToMature} months</p>
                            </div>
                        </div>

                        <PieChart data={pieData} size={180} />
                    </div>

                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Growth Over Time</h3>
                        <GrowthChart data={yearlyData} />
                    </div>

                    <AIInsights insights={insights} />
                </div>
            </div>
        </div>
    );
}
