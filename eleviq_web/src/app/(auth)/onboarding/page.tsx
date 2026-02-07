'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Briefcase, Check, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils/cn';

type UserType = 'student' | 'professional';

export default function OnboardingPage() {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState<UserType | null>(null);
    const { setUserType } = useAuthStore();

    const handleContinue = () => {
        if (selectedType) {
            setUserType(selectedType);
            // TODO: Save to Firestore
            router.push('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
            <div className="w-full max-w-xl">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-4 shadow-lg shadow-blue-600/30">
                        <Wallet size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Tell us about yourself
                    </h1>
                    <p className="text-slate-500 mt-2">
                        This helps us personalize your financial advice
                    </p>
                </div>

                {/* Selection Cards */}
                <div className="space-y-4 mb-8">
                    {/* Student Card */}
                    <button
                        onClick={() => setSelectedType('student')}
                        className={cn(
                            'w-full p-6 rounded-2xl border-2 text-left transition-all duration-200',
                            selectedType === 'student'
                                ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-600/10'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                        )}
                    >
                        <div className="flex items-center gap-5">
                            <div
                                className={cn(
                                    'flex items-center justify-center w-14 h-14 rounded-xl transition-colors',
                                    selectedType === 'student'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-600'
                                )}
                            >
                                <GraduationCap size={28} />
                            </div>
                            <div className="flex-1">
                                <h3
                                    className={cn(
                                        'text-lg font-semibold',
                                        selectedType === 'student'
                                            ? 'text-blue-700'
                                            : 'text-slate-900'
                                    )}
                                >
                                    Student
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    I&apos;m studying and managing limited funds
                                </p>
                            </div>
                            {selectedType === 'student' && (
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white">
                                    <Check size={18} />
                                </div>
                            )}
                        </div>
                    </button>

                    {/* Professional Card */}
                    <button
                        onClick={() => setSelectedType('professional')}
                        className={cn(
                            'w-full p-6 rounded-2xl border-2 text-left transition-all duration-200',
                            selectedType === 'professional'
                                ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-600/10'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                        )}
                    >
                        <div className="flex items-center gap-5">
                            <div
                                className={cn(
                                    'flex items-center justify-center w-14 h-14 rounded-xl transition-colors',
                                    selectedType === 'professional'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-600'
                                )}
                            >
                                <Briefcase size={28} />
                            </div>
                            <div className="flex-1">
                                <h3
                                    className={cn(
                                        'text-lg font-semibold',
                                        selectedType === 'professional'
                                            ? 'text-blue-700'
                                            : 'text-slate-900'
                                    )}
                                >
                                    Professional
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    I&apos;m working and earning regular income
                                </p>
                            </div>
                            {selectedType === 'professional' && (
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white">
                                    <Check size={18} />
                                </div>
                            )}
                        </div>
                    </button>
                </div>

                {/* Continue Button */}
                <Button
                    onClick={handleContinue}
                    disabled={!selectedType}
                    className="w-full"
                    size="lg"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}
