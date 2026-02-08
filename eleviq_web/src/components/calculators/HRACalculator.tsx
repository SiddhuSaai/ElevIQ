'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Calculator } from 'lucide-react';
import { SliderInput, PieChart, AIInsights } from './shared';

interface HRACalculatorProps {
    onBack?: () => void;
}

export function HRACalculator({ onBack }: HRACalculatorProps) {
    const [basicSalary, setBasicSalary] = useState(50000);
    const [hraReceived, setHraReceived] = useState(20000);
    const [rentPaid, setRentPaid] = useState(25000);
    const [isMetro, setIsMetro] = useState(true);

    const result = useMemo(() => {
        const annualBasic = basicSalary * 12;
        const annualHRA = hraReceived * 12;
        const annualRent = rentPaid * 12;

        // Three conditions for HRA exemption
        const condition1 = annualHRA; // Actual HRA received
        const condition2 = annualRent - (0.1 * annualBasic); // Rent paid - 10% of basic
        const condition3 = (isMetro ? 0.5 : 0.4) * annualBasic; // 50% or 40% of basic

        const exemption = Math.max(0, Math.min(condition1, condition2, condition3));
        const taxableHRA = annualHRA - exemption;

        // Assuming 30% tax bracket
        const taxSaved = exemption * 0.3;

        return {
            exemption,
            taxableHRA,
            taxSaved,
            annualHRA,
            condition1,
            condition2: Math.max(0, condition2),
            condition3,
        };
    }, [basicSalary, hraReceived, rentPaid, isMetro]);

    const formatCurrency = (value: number) => {
        if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
        return `₹${value.toLocaleString()}`;
    };

    const pieData = [
        { label: 'Exempt HRA', value: result.exemption, color: '#10b981' },
        { label: 'Taxable HRA', value: result.taxableHRA, color: '#ef4444' },
    ];

    const insights = useMemo(() => {
        const tips: { type: 'tip' | 'warning' | 'goal'; title: string; message: string }[] = [];

        tips.push({
            type: 'goal',
            title: 'Tax Saved',
            message: `You save ~${formatCurrency(result.taxSaved)} in taxes annually through HRA exemption.`,
        });

        if (result.condition2 < result.condition1 && result.condition2 < result.condition3) {
            tips.push({
                type: 'tip',
                title: 'Increase Rent',
                message: 'Paying a bit more rent could increase your HRA exemption.',
            });
        }

        if (!isMetro) {
            tips.push({
                type: 'warning',
                title: 'Non-Metro Status',
                message: 'Non-metro cities get 40% of basic as limit vs 50% for metros.',
            });
        }

        return tips;
    }, [result, isMetro]);

    return (
        <div className="space-y-6">
            {onBack && (
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to calculators</span>
                </button>
            )}

            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Home className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">HRA Calculator</h2>
                </div>
                <p className="text-amber-100">Calculate House Rent Allowance exemption</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Salary Details</h3>
                        <div className="space-y-6">
                            <SliderInput
                                label="Basic Salary (Monthly)"
                                value={basicSalary}
                                onChange={setBasicSalary}
                                min={10000}
                                max={500000}
                                step={1000}
                                prefix="₹"
                                quickValues={[30000, 50000, 75000, 100000]}
                            />
                            <SliderInput
                                label="HRA Received (Monthly)"
                                value={hraReceived}
                                onChange={setHraReceived}
                                min={0}
                                max={basicSalary}
                                step={500}
                                prefix="₹"
                            />
                            <SliderInput
                                label="Rent Paid (Monthly)"
                                value={rentPaid}
                                onChange={setRentPaid}
                                min={0}
                                max={100000}
                                step={500}
                                prefix="₹"
                                quickValues={[15000, 25000, 35000, 50000]}
                            />

                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Metro City (50% limit)</span>
                                <button
                                    onClick={() => setIsMetro(!isMetro)}
                                    className={`w-12 h-6 rounded-full transition-colors ${isMetro ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <motion.div
                                        className="w-5 h-5 bg-white rounded-full shadow-md"
                                        animate={{ x: isMetro ? 26 : 2 }}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">HRA Breakdown</h3>

                        <div className="text-center p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl mb-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Annual HRA Exemption</p>
                            <p className="text-4xl font-bold text-green-600">{formatCurrency(result.exemption)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tax saved: ~{formatCurrency(result.taxSaved)}</p>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Actual HRA</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(result.condition1)}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Rent - 10% Basic</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(result.condition2)}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{isMetro ? '50%' : '40%'} of Basic</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(result.condition3)}</span>
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
