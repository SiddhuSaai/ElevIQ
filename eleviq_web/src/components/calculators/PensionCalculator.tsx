'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, PiggyBank, Calculator } from 'lucide-react';
import { SliderInput, PieChart, GrowthChart, AIInsights } from './shared';

interface PensionCalculatorProps {
    onBack?: () => void;
}

export function PensionCalculator({ onBack }: PensionCalculatorProps) {
    const [currentAge, setCurrentAge] = useState(30);
    const [retirementAge, setRetirementAge] = useState(60);
    const [monthlyContribution, setMonthlyContribution] = useState(10000);
    const [employerContribution, setEmployerContribution] = useState(10000);
    const [currentCorpus, setCurrentCorpus] = useState(500000);
    const [expectedReturn, setExpectedReturn] = useState(10);
    const [annuityRate, setAnnuityRate] = useState(6);

    const result = useMemo(() => {
        const yearsToRetirement = retirementAge - currentAge;
        const n = yearsToRetirement * 12;
        const r = expectedReturn / 12 / 100;
        const totalMonthly = monthlyContribution + employerContribution;

        // Future value of current corpus
        const fvCurrent = currentCorpus * Math.pow(1 + expectedReturn / 100, yearsToRetirement);

        // Future value of monthly contributions
        const fvContributions = totalMonthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);

        const totalCorpus = fvCurrent + fvContributions;

        // 40% withdrawal allowed, 60% must be used for annuity (NPS rules)
        const lumpsum = totalCorpus * 0.4;
        const annuityCorpus = totalCorpus * 0.6;

        // Monthly pension from annuity
        const monthlyPension = (annuityCorpus * annuityRate / 100) / 12;

        // Total invested
        const totalInvested = currentCorpus + (totalMonthly * n);
        const returns = totalCorpus - totalInvested;

        return {
            totalCorpus,
            lumpsum,
            annuityCorpus,
            monthlyPension,
            totalInvested,
            returns,
            yearsToRetirement,
        };
    }, [currentAge, retirementAge, monthlyContribution, employerContribution, currentCorpus, expectedReturn, annuityRate]);

    const yearlyData = useMemo(() => {
        const data = [];
        let corpus = currentCorpus;
        const totalMonthly = monthlyContribution + employerContribution;
        const r = expectedReturn / 12 / 100;

        for (let year = 0; year <= result.yearsToRetirement; year++) {
            data.push({ year, value: corpus });
            corpus = corpus * (1 + expectedReturn / 100) + (totalMonthly * 12);
        }
        return data;
    }, [currentCorpus, monthlyContribution, employerContribution, result.yearsToRetirement, expectedReturn]);

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
        if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
        return `₹${value.toLocaleString()}`;
    };

    const pieData = [
        { label: 'Lumpsum (40%)', value: result.lumpsum, color: '#10b981' },
        { label: 'Annuity (60%)', value: result.annuityCorpus, color: '#6366f1' },
    ];

    const insights = useMemo(() => {
        const tips: { type: 'tip' | 'warning' | 'goal'; title: string; message: string }[] = [];

        tips.push({
            type: 'goal',
            title: 'Monthly Pension',
            message: `You'll receive approximately ${formatCurrency(result.monthlyPension)}/month pension after retirement.`,
        });

        tips.push({
            type: 'tip',
            title: 'Tax Benefits',
            message: 'NPS contributions up to ₹50,000 give additional tax benefit under 80CCD(1B).',
        });

        if (monthlyContribution < employerContribution) {
            tips.push({
                type: 'tip',
                title: 'Match Employer',
                message: 'Consider matching your contribution to employer\'s for maximum benefit.',
            });
        }

        return tips;
    }, [result, monthlyContribution, employerContribution]);

    return (
        <div className="space-y-6">
            {onBack && (
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to calculators</span>
                </button>
            )}

            <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <PiggyBank className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Pension Calculator</h2>
                </div>
                <p className="text-pink-100">Estimate your NPS pension and retirement corpus</p>
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
                                    min={18}
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
                                label="Current NPS Corpus"
                                value={currentCorpus}
                                onChange={setCurrentCorpus}
                                min={0}
                                max={10000000}
                                step={50000}
                                prefix="₹"
                                formatValue={(v) => formatCurrency(v)}
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Contributions</h3>
                        <div className="space-y-6">
                            <SliderInput
                                label="Your Monthly Contribution"
                                value={monthlyContribution}
                                onChange={setMonthlyContribution}
                                min={500}
                                max={100000}
                                step={500}
                                prefix="₹"
                                quickValues={[5000, 10000, 25000, 50000]}
                            />
                            <SliderInput
                                label="Employer Contribution"
                                value={employerContribution}
                                onChange={setEmployerContribution}
                                min={0}
                                max={100000}
                                step={500}
                                prefix="₹"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <SliderInput
                                    label="Expected Return"
                                    value={expectedReturn}
                                    onChange={setExpectedReturn}
                                    min={6}
                                    max={15}
                                    step={0.5}
                                    suffix="%"
                                />
                                <SliderInput
                                    label="Annuity Rate"
                                    value={annuityRate}
                                    onChange={setAnnuityRate}
                                    min={4}
                                    max={10}
                                    step={0.5}
                                    suffix="%"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Retirement Benefits</h3>

                        <div className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-xl p-6 text-center mb-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Corpus at Retirement</p>
                            <p className="text-4xl font-bold text-pink-600">{formatCurrency(result.totalCorpus)}</p>
                            <p className="text-sm text-green-600 mt-1">Returns: +{formatCurrency(result.returns)}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Lumpsum (40%)</p>
                                <p className="text-xl font-bold text-green-600">{formatCurrency(result.lumpsum)}</p>
                            </div>
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Pension</p>
                                <p className="text-xl font-bold text-indigo-600">{formatCurrency(result.monthlyPension)}</p>
                            </div>
                        </div>

                        <PieChart data={pieData} size={180} />
                    </div>

                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Corpus Growth</h3>
                        <GrowthChart data={yearlyData} />
                    </div>

                    <AIInsights insights={insights} />
                </div>
            </div>
        </div>
    );
}
