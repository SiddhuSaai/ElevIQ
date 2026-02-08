'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Wallet, TrendingUp } from 'lucide-react';
import { SliderInput, PieChart, GrowthChart, AIInsights } from './shared';

interface LumpsumCalculatorProps {
    onBack?: () => void;
}

export function LumpsumCalculator({ onBack }: LumpsumCalculatorProps) {
    const [investmentAmount, setInvestmentAmount] = useState(1000000);
    const [expectedReturn, setExpectedReturn] = useState(12);
    const [timePeriod, setTimePeriod] = useState(10);

    const result = useMemo(() => {
        const futureValue = investmentAmount * Math.pow(1 + expectedReturn / 100, timePeriod);
        const returns = futureValue - investmentAmount;
        const absoluteReturn = (returns / investmentAmount) * 100;

        return {
            futureValue,
            returns,
            invested: investmentAmount,
            absoluteReturn,
        };
    }, [investmentAmount, expectedReturn, timePeriod]);

    const yearlyData = useMemo(() => {
        const data = [];
        for (let year = 0; year <= timePeriod; year++) {
            data.push({
                year,
                value: investmentAmount * Math.pow(1 + expectedReturn / 100, year),
            });
        }
        return data;
    }, [investmentAmount, expectedReturn, timePeriod]);

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
        if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
        return `₹${value.toLocaleString()}`;
    };

    const pieData = [
        { label: 'Invested', value: result.invested, color: '#6366f1' },
        { label: 'Returns', value: result.returns, color: '#10b981' },
    ];

    const insights = useMemo(() => {
        const tips: { type: 'tip' | 'warning' | 'goal'; title: string; message: string }[] = [];

        tips.push({
            type: 'goal',
            title: 'Wealth Multiplier',
            message: `Your money grows ${(result.futureValue / investmentAmount).toFixed(1)}x in ${timePeriod} years at ${expectedReturn}% returns!`,
        });

        const extraYearValue = investmentAmount * Math.pow(1 + expectedReturn / 100, timePeriod + 1);
        tips.push({
            type: 'tip',
            title: 'Power of One More Year',
            message: `Staying invested 1 more year adds ${formatCurrency(extraYearValue - result.futureValue)} to your corpus.`,
        });

        if (expectedReturn < 12) {
            tips.push({
                type: 'warning',
                title: 'Consider Equity',
                message: 'Historical equity returns have been 12-15%. Consider allocating to equity for higher growth.',
            });
        }

        return tips;
    }, [result, investmentAmount, expectedReturn, timePeriod]);

    return (
        <div className="space-y-6">
            {onBack && (
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to calculators</span>
                </button>
            )}

            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Wallet className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Lumpsum Calculator</h2>
                </div>
                <p className="text-indigo-100">Calculate returns on one-time investment</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Investment Details</h3>
                        <div className="space-y-6">
                            <SliderInput
                                label="Investment Amount"
                                value={investmentAmount}
                                onChange={setInvestmentAmount}
                                min={10000}
                                max={50000000}
                                step={10000}
                                prefix="₹"
                                formatValue={(v) => v >= 100000 ? `${(v / 100000).toFixed(0)}L` : v.toLocaleString()}
                                quickValues={[500000, 1000000, 2500000, 5000000]}
                            />
                            <SliderInput
                                label="Expected Return"
                                value={expectedReturn}
                                onChange={setExpectedReturn}
                                min={5}
                                max={25}
                                step={0.5}
                                suffix="% p.a."
                                quickValues={[8, 12, 15, 20]}
                            />
                            <SliderInput
                                label="Time Period"
                                value={timePeriod}
                                onChange={setTimePeriod}
                                min={1}
                                max={30}
                                step={1}
                                suffix=" yrs"
                                quickValues={[5, 10, 15, 20, 25]}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Returns Summary</h3>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Invested</p>
                                <p className="text-xl font-bold text-indigo-600">{formatCurrency(result.invested)}</p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Returns</p>
                                <p className="text-xl font-bold text-green-600">+{formatCurrency(result.returns)}</p>
                            </div>
                        </div>

                        <div className="text-center p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl mb-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white">{formatCurrency(result.futureValue)}</p>
                            <p className="text-sm text-green-600 mt-1">+{result.absoluteReturn.toFixed(0)}% absolute return</p>
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
