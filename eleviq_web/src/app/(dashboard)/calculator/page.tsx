'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calculator,
    Home,
    TrendingUp,
    PiggyBank,
    Flame,
    FileText,
    Scale,
    Wallet,
    Target,
    Building2,
    CreditCard,
    Sparkles,
} from 'lucide-react';
import {
    EMICalculator,
    SIPCalculator,
    LoanComparison,
    FIRECalculator,
    TaxCalculator,
    HomeLoanEligibility,
    PrepaymentCalculator,
    LumpsumCalculator,
    GoalPlanner,
    CompoundInterestCalculator,
    FDCalculator,
    RDCalculator,
    HRACalculator,
    RetirementCorpusCalculator,
    PensionCalculator,
} from '@/components/calculators';

// Category definitions
const categories = [
    { id: 'loans', name: 'Loans', icon: Home, color: 'from-blue-500 to-cyan-500' },
    { id: 'investments', name: 'Investments', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { id: 'interest', name: 'Interest', icon: PiggyBank, color: 'from-purple-500 to-violet-500' },
    { id: 'tax', name: 'Tax', icon: FileText, color: 'from-amber-500 to-orange-500' },
    { id: 'retirement', name: 'Retirement', icon: Flame, color: 'from-red-500 to-rose-500' },
];

// Calculator definitions
const calculators = [
    // Loans
    { id: 'emi', name: 'EMI Calculator', icon: Home, description: 'Calculate loan EMI & schedule', category: 'loans', popular: true, component: EMICalculator },
    { id: 'home-eligibility', name: 'Home Loan Eligibility', icon: Building2, description: 'Check your eligibility', category: 'loans', component: HomeLoanEligibility },
    { id: 'compare-loans', name: 'Loan Comparison', icon: Scale, description: 'Compare multiple loans', category: 'loans', component: LoanComparison },
    { id: 'prepayment', name: 'Prepayment Calculator', icon: CreditCard, description: 'Save on prepayments', category: 'loans', component: PrepaymentCalculator },

    // Investments
    { id: 'sip', name: 'SIP Calculator', icon: TrendingUp, description: 'Plan your SIP investments', category: 'investments', popular: true, component: SIPCalculator },
    { id: 'lumpsum', name: 'Lumpsum Calculator', icon: Wallet, description: 'One-time investment', category: 'investments', component: LumpsumCalculator },
    { id: 'goal', name: 'Goal Planner', icon: Target, description: 'Achieve your goals', category: 'investments', component: GoalPlanner },
    { id: 'fire', name: 'FIRE Calculator', icon: Flame, description: 'Retire early planning', category: 'investments', popular: true, component: FIRECalculator },

    // Interest
    { id: 'compound', name: 'Compound Interest', icon: PiggyBank, description: 'Power of compounding', category: 'interest', component: CompoundInterestCalculator },
    { id: 'fd', name: 'FD Calculator', icon: Building2, description: 'Fixed deposit returns', category: 'interest', component: FDCalculator },
    { id: 'rd', name: 'RD Calculator', icon: Wallet, description: 'Recurring deposit', category: 'interest', component: RDCalculator },

    // Tax
    { id: 'income-tax', name: 'Income Tax', icon: FileText, description: 'Old vs New regime', category: 'tax', popular: true, component: TaxCalculator },
    { id: 'hra', name: 'HRA Exemption', icon: Home, description: 'Calculate HRA benefit', category: 'tax', component: HRACalculator },

    // Retirement
    { id: 'retirement', name: 'Retirement Corpus', icon: Flame, description: 'Plan your retirement', category: 'retirement', component: RetirementCorpusCalculator },
    { id: 'pension', name: 'Pension Calculator', icon: PiggyBank, description: 'Estimate pension', category: 'retirement', component: PensionCalculator },
];

export default function CalculatorPage() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeCalculator, setActiveCalculator] = useState<string | null>(null);

    const filteredCalculators = activeCategory
        ? calculators.filter((c) => c.category === activeCategory)
        : calculators;

    const popularCalculators = calculators.filter((c) => c.popular);

    const selectedCalculator = calculators.find((c) => c.id === activeCalculator);
    const CalculatorComponent = selectedCalculator?.component;

    const handleBack = () => {
        setActiveCalculator(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#0a0a0a] p-4 lg:p-8">
            <AnimatePresence mode="wait">
                {activeCalculator && CalculatorComponent ? (
                    <motion.div
                        key="calculator"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <CalculatorComponent onBack={handleBack} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                    <Calculator className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                                        Financial Calculators
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Plan your finances with precision & AI insights
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* AI Banner */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-4 flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">AI-Powered Insights</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Get personalized suggestions based on your financial inputs
                                </p>
                            </div>
                        </motion.div>

                        {/* Popular Calculators */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                ⭐ Most Popular
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {popularCalculators.map((calc, index) => {
                                    const Icon = calc.icon;
                                    const category = categories.find((c) => c.id === calc.category);
                                    return (
                                        <motion.button
                                            key={calc.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => setActiveCalculator(calc.id)}
                                            className="relative group p-5 rounded-2xl border-2 text-left transition-all bg-white dark:bg-[#171717] border-gray-100 dark:border-white/5 hover:border-blue-500 hover:shadow-lg cursor-pointer"
                                        >
                                            <div
                                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category?.color} flex items-center justify-center mb-3`}
                                            >
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                {calc.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {calc.description}
                                            </p>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className="mb-6 overflow-x-auto pb-2">
                            <div className="flex gap-2 min-w-max">
                                <button
                                    onClick={() => setActiveCategory(null)}
                                    className={`px-4 py-2.5 rounded-xl font-medium transition-all ${activeCategory === null
                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                        : 'bg-white dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/20'
                                        }`}
                                >
                                    All
                                </button>
                                {categories.map((category) => {
                                    const Icon = category.icon;
                                    return (
                                        <button
                                            key={category.id}
                                            onClick={() => setActiveCategory(category.id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${activeCategory === category.id
                                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                                : 'bg-white dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/20'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {category.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Calculator Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredCalculators.map((calc, index) => {
                                const Icon = calc.icon;
                                const category = categories.find((c) => c.id === calc.category);
                                return (
                                    <motion.button
                                        key={calc.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => setActiveCalculator(calc.id)}
                                        className="relative group p-5 rounded-2xl border-2 text-left transition-all bg-white dark:bg-[#171717] border-gray-100 dark:border-white/5 hover:border-blue-500 hover:shadow-lg cursor-pointer"
                                    >
                                        {calc.popular && (
                                            <span className="absolute top-2 right-2 text-xs bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                                                ⭐ Popular
                                            </span>
                                        )}
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category?.color} flex items-center justify-center flex-shrink-0`}
                                            >
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                    {calc.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {calc.description}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
