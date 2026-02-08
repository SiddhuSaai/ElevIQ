'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, TrendingDown, Calendar } from 'lucide-react';
import { SliderInput, GrowthChart, AIInsights } from './shared';

interface PrepaymentCalculatorProps {
    onBack?: () => void;
}

export function PrepaymentCalculator({ onBack }: PrepaymentCalculatorProps) {
    const [loanAmount, setLoanAmount] = useState(5000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [loanTenure, setLoanTenure] = useState(20);
    const [prepaymentAmount, setPrepaymentAmount] = useState(500000);
    const [prepaymentYear, setPrepaymentYear] = useState(3);

    const result = useMemo(() => {
        const r = interestRate / 12 / 100;
        const n = loanTenure * 12;

        // Original EMI
        const emi = loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        const totalWithoutPrepay = emi * n;
        const interestWithoutPrepay = totalWithoutPrepay - loanAmount;

        // Calculate balance at prepayment year
        const monthsBeforePrepay = prepaymentYear * 12;
        let balance = loanAmount;
        for (let i = 0; i < monthsBeforePrepay; i++) {
            const interest = balance * r;
            balance = balance + interest - emi;
        }

        // New balance after prepayment
        const newBalance = Math.max(0, balance - prepaymentAmount);

        // Calculate new tenure with same EMI
        let newTenureMonths = 0;
        let tempBalance = newBalance;
        while (tempBalance > 0 && newTenureMonths < 360) {
            const interest = tempBalance * r;
            tempBalance = tempBalance + interest - emi;
            newTenureMonths++;
        }

        const totalWithPrepay = (monthsBeforePrepay * emi) + prepaymentAmount + (newTenureMonths * emi);
        const interestWithPrepay = totalWithPrepay - loanAmount;

        const interestSaved = interestWithoutPrepay - interestWithPrepay;
        const timeSaved = (loanTenure * 12) - (monthsBeforePrepay + newTenureMonths);

        return {
            emi,
            totalWithoutPrepay,
            totalWithPrepay,
            interestWithoutPrepay,
            interestWithPrepay,
            interestSaved: Math.max(0, interestSaved),
            timeSaved: Math.max(0, timeSaved),
            newTenureMonths,
        };
    }, [loanAmount, interestRate, loanTenure, prepaymentAmount, prepaymentYear]);

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
        if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
        return `₹${value.toLocaleString()}`;
    };

    const insights = useMemo(() => {
        const tips: { type: 'tip' | 'warning' | 'goal'; title: string; message: string }[] = [];

        tips.push({
            type: 'goal',
            title: 'Interest Saved',
            message: `You save ${formatCurrency(result.interestSaved)} by prepaying ${formatCurrency(prepaymentAmount)} in year ${prepaymentYear}!`,
        });

        if (result.timeSaved >= 12) {
            tips.push({
                type: 'tip',
                title: 'Time Saved',
                message: `Your loan closes ${Math.floor(result.timeSaved / 12)} years ${result.timeSaved % 12} months earlier!`,
            });
        }

        tips.push({
            type: 'tip',
            title: 'Prepay Earlier',
            message: 'Prepaying in year 1 instead saves even more due to higher outstanding balance.',
        });

        return tips;
    }, [result, prepaymentAmount, prepaymentYear]);

    return (
        <div className="space-y-6">
            {onBack && (
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to calculators</span>
                </button>
            )}

            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Prepayment Calculator</h2>
                </div>
                <p className="text-green-100">See how much you save with loan prepayment</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Loan Details</h3>
                        <div className="space-y-6">
                            <SliderInput
                                label="Loan Amount"
                                value={loanAmount}
                                onChange={setLoanAmount}
                                min={500000}
                                max={50000000}
                                step={100000}
                                prefix="₹"
                                formatValue={(v) => (v / 100000).toFixed(0) + 'L'}
                                quickValues={[2500000, 5000000, 10000000, 20000000]}
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
                            <SliderInput
                                label="Loan Tenure"
                                value={loanTenure}
                                onChange={setLoanTenure}
                                min={5}
                                max={30}
                                step={1}
                                suffix=" yrs"
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Prepayment Plan</h3>
                        <div className="space-y-6">
                            <SliderInput
                                label="Prepayment Amount"
                                value={prepaymentAmount}
                                onChange={setPrepaymentAmount}
                                min={50000}
                                max={loanAmount * 0.5}
                                step={50000}
                                prefix="₹"
                                formatValue={(v) => (v / 100000).toFixed(1) + 'L'}
                            />
                            <SliderInput
                                label="Prepay in Year"
                                value={prepaymentYear}
                                onChange={setPrepaymentYear}
                                min={1}
                                max={loanTenure - 1}
                                step={1}
                                suffix=""
                                quickValues={[1, 3, 5, 10]}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Savings Summary</h3>

                        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 mb-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Interest Saved</p>
                            <p className="text-4xl font-bold text-green-600">{formatCurrency(result.interestSaved)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                {Math.floor(result.timeSaved / 12)} years {result.timeSaved % 12} months saved
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Without Prepayment</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(result.totalWithoutPrepay)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Interest</p>
                                    <p className="text-lg font-semibold text-red-500">{formatCurrency(result.interestWithoutPrepay)}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-500/10 rounded-xl">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">With Prepayment</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(result.totalWithPrepay)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Interest</p>
                                    <p className="text-lg font-semibold text-green-600">{formatCurrency(result.interestWithPrepay)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <AIInsights insights={insights} />
                </div>
            </div>
        </div>
    );
}
