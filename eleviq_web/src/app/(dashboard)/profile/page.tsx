'use client';

import { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Target,
    Save,
    Check,
    CircleUserRound,
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useAuthStore } from '@/store/auth-store';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserProfile {
    displayName: string;
    email: string;
    monthlyIncome: number;
    savingsGoal: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}

const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
];

export default function ProfilePage() {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({
        displayName: '',
        email: '',
        monthlyIncome: 0,
        savingsGoal: 20,
        currency: 'INR',
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    useEffect(() => {
        const loadProfile = async () => {
            if (!user?.uid || !db) return;

            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProfile({
                        displayName: data.displayName || user.displayName || '',
                        email: data.email || user.email || '',
                        monthlyIncome: data.monthlyIncome || 0,
                        savingsGoal: data.savingsGoal || 20,
                        currency: data.currency || 'INR',
                        createdAt: data.createdAt?.toDate() || new Date(),
                        updatedAt: data.updatedAt?.toDate() || new Date(),
                    });
                } else {
                    setProfile({
                        displayName: user.displayName || '',
                        email: user.email || '',
                        monthlyIncome: 0,
                        savingsGoal: 20,
                        currency: 'INR',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }
            } catch (error) {
                console.error('Failed to load profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, [user]);

    const handleSave = async () => {
        if (!user?.uid || !db) return;

        setIsSaving(true);
        try {
            const docRef = doc(db, 'users', user.uid);
            await setDoc(docRef, {
                ...profile,
                updatedAt: new Date(),
            }, { merge: true });

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const selectedCurrency = currencies.find(c => c.code === profile.currency);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#0a0a0a]">
            <PageHeader icon={CircleUserRound} iconColor="text-blue-400" title="Profile" />
            <div className="p-4 lg:p-8">

                <div className="max-w-3xl space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                        {/* Header with Avatar */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                                    {profile.displayName?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="text-white">
                                    <h2 className="text-xl font-bold">{profile.displayName || 'User'}</h2>
                                    <p className="text-blue-100">{profile.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="p-6 space-y-6">
                            {/* Personal Info */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={profile.displayName}
                                                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Your name"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={profile.email}
                                                disabled
                                                className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Settings */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                                    Financial Settings
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Monthly Income
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                                                {selectedCurrency?.symbol}
                                            </span>
                                            <input
                                                type="number"
                                                value={profile.monthlyIncome || ''}
                                                onChange={(e) => setProfile({ ...profile, monthlyIncome: parseFloat(e.target.value) || 0 })}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Savings Goal (% of income)
                                        </label>
                                        <div className="relative">
                                            <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={profile.savingsGoal}
                                                onChange={(e) => setProfile({ ...profile, savingsGoal: parseInt(e.target.value) || 0 })}
                                                className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Currency Selector */}
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Currency
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {currencies.map((currency) => (
                                            <button
                                                key={currency.code}
                                                type="button"
                                                onClick={() => setProfile({ ...profile, currency: currency.code })}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${profile.currency === currency.code
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-white'
                                                    }`}
                                            >
                                                <span className="text-lg font-bold">{currency.symbol}</span>
                                                <span className="text-sm font-medium">{currency.code}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Stats Preview */}
                            {profile.monthlyIncome > 0 && (
                                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                                        Monthly Budget Preview
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {selectedCurrency?.symbol}{profile.monthlyIncome.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Income</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-green-600">
                                                {selectedCurrency?.symbol}{((profile.monthlyIncome * profile.savingsGoal) / 100).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Target Savings</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-600">
                                                {selectedCurrency?.symbol}{(profile.monthlyIncome - (profile.monthlyIncome * profile.savingsGoal) / 100).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Available to Spend</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition-all ${saved
                                    ? 'bg-green-600 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25'
                                    }`}
                            >
                                {saved ? (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Saved!
                                    </>
                                ) : isSaving ? (
                                    'Saving...'
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
