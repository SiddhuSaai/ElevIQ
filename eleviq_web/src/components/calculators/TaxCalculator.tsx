'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Check, X } from 'lucide-react';
import { SliderInput, PieChart, BarChart, AIInsights } from './shared';

interface TaxCalculatorProps {
    onBack?: () => void;
}

// Tax slabs for FY 2024-25
const oldRegimeSlabs = [
    { min: 0, max: 250000, rate: 0 },
    { min: 250000, max: 500000, rate: 5 },
    { min: 500000, max: 1000000, rate: 20 },
    { min: 1000000, max: Infinity, rate: 30 },
];

const newRegimeSlabs = [
    { min: 0, max: 300000, rate: 0 },
    { min: 300000, max: 600000, rate: 5 },
    { min: 600000, max: 900000, rate: 10 },
    { min: 900000, max: 1200000, rate: 15 },
    { min: 1200000, max: 1500000, rate: 20 },
    { min: 1500000, max: Infinity, rate: 30 },
];

function calculateTax(income: number, slabs: typeof oldRegimeSlabs): number {
    let tax = 0;
    let remaining = income;

    for (const slab of slabs) {
        if (remaining <= 0) break;

        const taxableInSlab = Math.min(remaining, slab.max - slab.min);
        tax += taxableInSlab * (slab.rate / 100);
        remaining -= taxableInSlab;
    }

    return tax;
}

// Helper function - defined outside component to avoid initialization issues
const formatCurrencyTax = (value: number) => {
    if (value >= 100000) return `${(value / 100000).toFixed(2)}L`;
    return value.toLocaleString();
};

export function TaxCalculator({ onBack }: TaxCalculatorProps) {
    const [grossSalary, setGrossSalary] = useState(1500000);
    const [otherIncome, setOtherIncome] = useState(50000);
    const [regime, setRegime] = useState<'old' | 'new'>('new');

    // Deductions (only applicable in old regime)
    const [section80C, setSection80C] = useState(150000);
    const [section80D, setSection80D] = useState(25000);
    const [nps, setNps] = useState(50000);
    const [hra, setHra] = useState(0);
    const [otherDeductions, setOtherDeductions] = useState(0);

    // Calculate taxes for both regimes
    const result = useMemo(() => {
        const totalIncome = grossSalary + otherIncome;

        // Old Regime Calculation
        const totalDeductionsOld = Math.min(section80C, 150000) + Math.min(section80D, 25000) + Math.min(nps, 50000) + hra + otherDeductions;
        const standardDeductionOld = 50000;
        const taxableIncomeOld = Math.max(0, totalIncome - totalDeductionsOld - standardDeductionOld);
        const taxOld = calculateTax(taxableIncomeOld, oldRegimeSlabs);
        const cessOld = taxOld * 0.04;
        const totalTaxOld = taxOld + cessOld;

        // New Regime Calculation
        const standardDeductionNew = 75000; // Updated for 2024-25
        const taxableIncomeNew = Math.max(0, totalIncome - standardDeductionNew);
        const taxNew = calculateTax(taxableIncomeNew, newRegimeSlabs);
        const cessNew = taxNew * 0.04;
        const totalTaxNew = taxNew + cessNew;

        const betterRegime = totalTaxOld < totalTaxNew ? 'old' : 'new';
        const savings = Math.abs(totalTaxOld - totalTaxNew);

        // Slab-wise breakdown for selected regime
        const slabs = regime === 'old' ? oldRegimeSlabs : newRegimeSlabs;
        const taxableIncome = regime === 'old' ? taxableIncomeOld : taxableIncomeNew;
        const slabBreakdown: { range: string; amount: number; rate: number; tax: number }[] = [];
        let remaining = taxableIncome;

        for (const slab of slabs) {
            if (remaining <= 0) break;

            const taxableInSlab = Math.min(remaining, slab.max - slab.min);
            const taxInSlab = taxableInSlab * (slab.rate / 100);

            slabBreakdown.push({
                range: slab.max === Infinity
                    ? `Above ₹${(slab.min / 100000).toFixed(1)}L`
                    : `₹${(slab.min / 100000).toFixed(1)}L - ₹${(slab.max / 100000).toFixed(1)}L`,
                amount: taxableInSlab,
                rate: slab.rate,
                tax: taxInSlab,
            });

            remaining -= taxableInSlab;
        }

        return {
            totalIncome,
            taxableIncomeOld,
            taxableIncomeNew,
            totalTaxOld,
            totalTaxNew,
            betterRegime,
            savings,
            slabBreakdown,
            inHandOld: totalIncome - totalTaxOld,
            inHandNew: totalIncome - totalTaxNew,
        };
    }, [grossSalary, otherIncome, section80C, section80D, nps, hra, otherDeductions, regime]);

    // AI Insights
    const insights = useMemo(() => {
        const tips: { type: 'tip' | 'warning' | 'goal'; title: string; message: string }[] = [];

        if (result.betterRegime !== regime) {
            tips.push({
                type: 'warning',
                title: 'Switch Regime',
                message: `${result.betterRegime === 'old' ? 'Old' : 'New'} regime saves you ₹${formatCurrencyTax(result.savings)}!`,
            });
        } else {
            tips.push({
                type: 'goal',
                title: 'Optimal Choice',
                message: `You've selected the better regime. Saving ₹${formatCurrencyTax(result.savings)} vs the other option.`,
            });
        }

        if (regime === 'old') {
            const unutilized80C = 150000 - section80C;
            if (unutilized80C > 0) {
                tips.push({
                    type: 'tip',
                    title: '80C Limit Unutilized',
                    message: `Invest ₹${unutilized80C.toLocaleString()} more in 80C to save ₹${Math.round(unutilized80C * 0.3).toLocaleString()} in taxes.`,
                });
            }

            if (nps < 50000) {
                tips.push({
                    type: 'tip',
                    title: 'NPS Additional Benefit',
                    message: `Invest ₹${(50000 - nps).toLocaleString()} more in NPS for extra ₹${Math.round((50000 - nps) * 0.3).toLocaleString()} tax saving.`,
                });
            }
        }

        return tips;
    }, [result, regime, section80C, nps]);

    // Pie chart data
    const pieData = regime === 'new'
        ? [
            { label: 'In-Hand', value: result.inHandNew, color: '#22c55e' },
            { label: 'Tax', value: result.totalTaxNew, color: '#ef4444' },
        ]
        : [
            { label: 'In-Hand', value: result.inHandOld, color: '#22c55e' },
            { label: 'Tax', value: result.totalTaxOld, color: '#ef4444' },
        ];

    // Comparison bar chart
    const comparisonData = [
        { label: 'Old Regime', value: result.totalTaxOld, color: result.betterRegime === 'old' ? '#22c55e' : '#3b82f6' },
        { label: 'New Regime', value: result.totalTaxNew, color: result.betterRegime === 'new' ? '#22c55e' : '#3b82f6' },
    ];

    // Use the helper function
    const formatCurrency = formatCurrencyTax;

    const currentTax = regime === 'old' ? result.totalTaxOld : result.totalTaxNew;
    const currentInHand = regime === 'old' ? result.inHandOld : result.inHandNew;

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

            {/* Hero */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Income Tax Calculator</h2>
                </div>
                <p className="text-indigo-100">FY 2024-25 | Compare Old vs New Tax Regime</p>
            </div>

            {/* Regime Selector */}
            <div className="flex gap-4 p-2 bg-gray-100 dark:bg-white/10 rounded-xl">
                <button
                    onClick={() => setRegime('old')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${regime === 'old'
                        ? 'bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                        }`}
                >
                    Old Regime
                    {result.betterRegime === 'old' && (
                        <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Better</span>
                    )}
                </button>
                <button
                    onClick={() => setRegime('new')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${regime === 'new'
                        ? 'bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                        }`}
                >
                    New Regime
                    {result.betterRegime === 'new' && (
                        <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Better</span>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Income Details</h3>
                        <div className="space-y-6">
                            <SliderInput
                                label="Gross Salary"
                                value={grossSalary}
                                onChange={setGrossSalary}
                                min={300000}
                                max={10000000}
                                step={50000}
                                prefix="₹"
                                formatValue={formatCurrency}
                                quickValues={[500000, 1000000, 1500000, 2000000, 3000000]}
                            />
                            <SliderInput
                                label="Other Income (Interest, Rental, etc.)"
                                value={otherIncome}
                                onChange={setOtherIncome}
                                min={0}
                                max={2000000}
                                step={10000}
                                prefix="₹"
                                formatValue={formatCurrency}
                            />
                        </div>
                    </div>

                    {/* Deductions - Only for Old Regime */}
                    {regime === 'old' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Deductions</h3>
                            <div className="space-y-6">
                                <SliderInput
                                    label="Section 80C (Max ₹1.5L)"
                                    value={section80C}
                                    onChange={setSection80C}
                                    min={0}
                                    max={150000}
                                    step={5000}
                                    prefix="₹"
                                    formatValue={(v) => v.toLocaleString()}
                                    quickValues={[50000, 100000, 150000]}
                                />
                                <SliderInput
                                    label="Section 80D - Health Insurance"
                                    value={section80D}
                                    onChange={setSection80D}
                                    min={0}
                                    max={100000}
                                    step={5000}
                                    prefix="₹"
                                    formatValue={(v) => v.toLocaleString()}
                                    quickValues={[25000, 50000, 75000]}
                                />
                                <SliderInput
                                    label="NPS (Additional 80CCD)"
                                    value={nps}
                                    onChange={setNps}
                                    min={0}
                                    max={50000}
                                    step={5000}
                                    prefix="₹"
                                    formatValue={(v) => v.toLocaleString()}
                                />
                                <SliderInput
                                    label="HRA Exemption"
                                    value={hra}
                                    onChange={setHra}
                                    min={0}
                                    max={500000}
                                    step={10000}
                                    prefix="₹"
                                    formatValue={(v) => v.toLocaleString()}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* AI Insights */}
                    <AIInsights insights={insights} />
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-4 text-white"
                        >
                            <p className="text-red-100 text-xs mb-1">Total Tax</p>
                            <p className="text-2xl font-bold">₹{formatCurrency(currentTax)}</p>
                            <p className="text-xs text-red-100 mt-1">Including 4% cess</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white"
                        >
                            <p className="text-green-100 text-xs mb-1">In-Hand Income</p>
                            <p className="text-2xl font-bold">₹{formatCurrency(currentInHand)}</p>
                            <p className="text-xs text-green-100 mt-1">
                                {((currentInHand / result.totalIncome) * 100).toFixed(0)}% of gross
                            </p>
                        </motion.div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Income Breakdown
                        </h3>
                        <PieChart data={pieData} size={200} />
                    </div>

                    {/* Regime Comparison */}
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            📊 Regime Comparison
                        </h3>
                        <BarChart
                            data={comparisonData}
                            formatValue={(v) => `₹${formatCurrency(v)}`}
                        />
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                            <p className="text-green-700 dark:text-green-300 font-medium">
                                {result.betterRegime === 'old' ? 'Old' : 'New'} regime saves ₹{formatCurrency(result.savings)}
                            </p>
                        </div>
                    </div>

                    {/* Slab Breakdown */}
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Tax Slab Breakdown ({regime === 'old' ? 'Old' : 'New'} Regime)
                        </h3>
                        <div className="space-y-2">
                            {result.slabBreakdown.map((slab, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{slab.range}</span>
                                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                            {slab.rate}%
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        ₹{Math.round(slab.tax).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-white/10 rounded-lg font-medium">
                                <span className="text-gray-900 dark:text-white">Total Tax + Cess</span>
                                <span className="text-red-600">₹{Math.round(currentTax).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Feature Comparison */}
                    <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Regime Features
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500">
                                        <th className="p-2">Feature</th>
                                        <th className="p-2 text-center">Old</th>
                                        <th className="p-2 text-center">New</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {[
                                        { feature: '80C Deductions', old: true, new: false },
                                        { feature: 'HRA Exemption', old: true, new: false },
                                        { feature: '80D Health Insurance', old: true, new: false },
                                        { feature: 'NPS Benefits', old: true, new: false },
                                        { feature: 'Lower Tax Slabs', old: false, new: true },
                                        { feature: 'Standard Deduction', old: true, new: true },
                                    ].map((row, i) => (
                                        <tr key={i} className="text-gray-900 dark:text-white">
                                            <td className="p-2">{row.feature}</td>
                                            <td className="p-2 text-center">
                                                {row.old ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-red-400 mx-auto" />}
                                            </td>
                                            <td className="p-2 text-center">
                                                {row.new ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-red-400 mx-auto" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
