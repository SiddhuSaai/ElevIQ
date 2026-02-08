'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, CheckCircle, AlertTriangle } from 'lucide-react';
import { SliderInput, PieChart, AIInsights } from './shared';

interface HomeLoanEligibilityProps {
    onBack?: () => void;
}

export function HomeLoanEligibility({ onBack }: HomeLoanEligibilityProps) {
    const [monthlyIncome, setMonthlyIncome] = useState(150000);
    const [existingEMI, setExistingEMI] = useState(0);
    const [loanTenure, setLoanTenure] = useState(20);
    const [interestRate, setInterestRate] = useState(8.5);
    const [otherIncome, setOtherIncome] = useState(0);

    const result = useMemo(() => {
        const totalIncome = monthlyIncome + otherIncome;
        const foir = 0.5; // Fixed Obligations to Income Ratio (50%)
        const maxEMI = (totalIncome * foir) - existingEMI;

        const r = interestRate / 12 / 100;
        const n = loanTenure * 12;

        // Max loan = EMI * ((1+r)^n - 1) / (r * (1+r)^n)
        const maxLoan = maxEMI * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)));

        // Property value (assuming 80% LTV)
        const maxPropertyValue = maxLoan / 0.8;
        const downPayment = maxPropertyValue - maxLoan;

        return {
            maxLoan: Math.max(0, maxLoan),
            maxEMI: Math.max(0, maxEMI),
            maxPropertyValue: Math.max(0, maxPropertyValue),
            downPayment: Math.max(0, downPayment),
            totalIncome,
        };
    }, [monthlyIncome, existingEMI, loanTenure, interestRate, otherIncome]);

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
        if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
        return `₹${value.toLocaleString()}`;
    };

    const insights = useMemo(() => {
        const tips: { type: 'tip' | 'warning' | 'goal'; title: string; message: string }[] = [];

        if (existingEMI > monthlyIncome * 0.3) {
            tips.push({
                type: 'warning',
                title: 'High Existing EMI',
                message: 'Your existing EMI is over 30% of income. Consider paying off some loans first.',
            });
        }

        tips.push({
            type: 'tip',
            title: 'Increase Eligibility',
            message: `A co-applicant with ₹50k income would increase eligibility by ~${formatCurrency(result.maxLoan * 0.33)}`,
        });

        tips.push({
            type: 'goal',
            title: 'Down Payment Needed',
            message: `Save ${formatCurrency(result.downPayment)} for 20% down payment on your dream home.`,
        });

        return tips;
    }, [result, existingEMI, monthlyIncome]);

    const pieData = [
        { label: 'Loan Amount', value: result.maxLoan, color: '#3b82f6' },
        { label: 'Down Payment', value: result.downPayment, color: '#10b981' },
    ];

    return (
        <div className="space-y-6">
            {onBack && (
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to calculators</span>
                </button>
            )}

            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Home Loan Eligibility</h2>
                </div>
                <p className="text-blue-100">Check how much you can borrow based on your income</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Income Details</h3>
                        <div className="space-y-6">
                            <SliderInput
                                label="Monthly Salary"
                                value={monthlyIncome}
                                onChange={setMonthlyIncome}
                                min={25000}
                                max={1000000}
                                step={5000}
                                prefix="₹"
                                quickValues={[50000, 100000, 150000, 250000]}
                            />
                            <SliderInput
                                label="Other Monthly Income"
                                value={otherIncome}
                                onChange={setOtherIncome}
                                min={0}
                                max={500000}
                                step={5000}
                                prefix="₹"
                            />
                            <SliderInput
                                label="Existing EMIs"
                                value={existingEMI}
                                onChange={setExistingEMI}
                                min={0}
                                max={200000}
                                step={1000}
                                prefix="₹"
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Loan Details</h3>
                        <div className="space-y-6">
                            <SliderInput
                                label="Loan Tenure"
                                value={loanTenure}
                                onChange={setLoanTenure}
                                min={5}
                                max={30}
                                step={1}
                                suffix=" yrs"
                                quickValues={[10, 15, 20, 25, 30]}
                            />
                            <SliderInput
                                label="Interest Rate"
                                value={interestRate}
                                onChange={setInterestRate}
                                min={6}
                                max={15}
                                step={0.1}
                                suffix="% p.a."
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Your Eligibility</h3>
                        <div className="text-center mb-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Maximum Loan Amount</p>
                            <p className="text-4xl font-bold text-blue-600">{formatCurrency(result.maxLoan)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Max EMI</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(result.maxEMI)}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Max Property</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(result.maxPropertyValue)}</p>
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
