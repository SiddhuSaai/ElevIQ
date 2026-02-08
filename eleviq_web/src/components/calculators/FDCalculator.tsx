'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2 } from 'lucide-react';
import { SliderInput, PieChart, AIInsights } from './shared';

interface FDCalculatorProps {
    onBack?: () => void;
}

export function FDCalculator({ onBack }: FDCalculatorProps) {
    const [principal, setPrincipal] = useState(500000);
    const [interestRate, setInterestRate] = useState(7);
    const [tenure, setTenure] = useState(5);
    const [compounding, setCompounding] = useState<'yearly' | 'quarterly' | 'monthly'>('quarterly');
    const [isSeniorCitizen, setIsSeniorCitizen] = useState(false);

    const frequencyMap = { yearly: 1, quarterly: 4, monthly: 12 };

    const result = useMemo(() => {
        const effectiveRate = isSeniorCitizen ? interestRate + 0.5 : interestRate;
        const n = frequencyMap[compounding];
        const maturityAmount = principal * Math.pow(1 + effectiveRate / 100 / n, n * tenure);
        const interest = maturityAmount - principal;
        const effectiveYield = ((maturityAmount / principal) - 1) / tenure * 100;

        return {
            maturityAmount,
            interest,
            principal,
            effectiveRate,
            effectiveYield,
        };
    }, [principal, interestRate, tenure, compounding, isSeniorCitizen]);

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
        if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
        return `₹${value.toLocaleString()}`;
    };

    const pieData = [
        { label: 'Principal', value: result.principal, color: '#3b82f6' },
        { label: 'Interest', value: result.interest, color: '#10b981' },
    ];

    const insights = useMemo(() => {
        const tips: { type: 'tip' | 'warning' | 'goal'; title: string; message: string }[] = [];

        tips.push({
            type: 'goal',
            title: 'Maturity Value',
            message: `Your FD will mature at ${formatCurrency(result.maturityAmount)} earning ${formatCurrency(result.interest)} interest.`,
        });

        if (!isSeniorCitizen) {
            tips.push({
                type: 'tip',
                title: 'Senior Citizen Rate',
                message: `Senior citizens get 0.5% extra. If eligible, you'd earn ${formatCurrency(result.interest * 1.07)} more.`,
            });
        }

        if (interestRate < 8) {
            tips.push({
                type: 'warning',
                title: 'Consider Alternatives',
                message: 'Debt mutual funds or corporate FDs might offer better post-tax returns.',
            });
        }

        return tips;
    }, [result, isSeniorCitizen, interestRate]);

    return (
        <div className="space-y-6">
            {onBack && (
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to calculators</span>
                </button>
            )}

            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">FD Calculator</h2>
                </div>
                <p className="text-blue-100">Calculate Fixed Deposit maturity amount</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">FD Details</h3>
                        <div className="space-y-6">
                            <SliderInput
                                label="Deposit Amount"
                                value={principal}
                                onChange={setPrincipal}
                                min={10000}
                                max={10000000}
                                step={10000}
                                prefix="₹"
                                formatValue={(v) => formatCurrency(v)}
                                quickValues={[100000, 500000, 1000000, 2500000]}
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

                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Senior Citizen (+0.5%)</span>
                                <button
                                    onClick={() => setIsSeniorCitizen(!isSeniorCitizen)}
                                    className={`w-12 h-6 rounded-full transition-colors ${isSeniorCitizen ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <motion.div
                                        className="w-5 h-5 bg-white rounded-full shadow-md"
                                        animate={{ x: isSeniorCitizen ? 26 : 2 }}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compounding</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {(['yearly', 'quarterly', 'monthly'] as const).map((freq) => (
                                <button
                                    key={freq}
                                    onClick={() => setCompounding(freq)}
                                    className={`p-3 rounded-xl border-2 text-sm font-medium capitalize ${compounding === freq
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600'
                                            : 'border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-400'
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
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Maturity Details</h3>

                        <div className="text-center p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl mb-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Maturity Amount</p>
                            <p className="text-4xl font-bold text-blue-600">{formatCurrency(result.maturityAmount)}</p>
                            <p className="text-sm text-green-600 mt-1">+{formatCurrency(result.interest)} interest</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Effective Rate</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{result.effectiveRate}%</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Effective Yield</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{result.effectiveYield.toFixed(2)}%</p>
                            </div>
                        </div>

                        <PieChart data={pieData} size={180} />
                    </div>

                    <AIInsights insights={insights} />
                </div>
            </div>
        </div>
    );
}
