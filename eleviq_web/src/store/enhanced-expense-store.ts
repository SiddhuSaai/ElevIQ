'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    EnhancedExpense,
    CreateEnhancedExpenseInput,
    UpdateEnhancedExpenseInput,
    ExpenseItem,
    generateItemId,
    calculateExpenseTotal
} from '@/types/expense';

interface EnhancedExpenseState {
    expenses: EnhancedExpense[];
    isLoading: boolean;
    error: string | null;

    // Stats
    monthlyTotal: number;
    categoryTotals: Record<string, number>;

    // Actions
    addExpense: (input: CreateEnhancedExpenseInput) => string;
    updateExpense: (input: UpdateEnhancedExpenseInput) => void;
    deleteExpense: (id: string) => void;
    getExpenseById: (id: string) => EnhancedExpense | undefined;

    // Batch operations
    addMultipleExpenses: (inputs: CreateEnhancedExpenseInput[]) => string[];

    // Stats
    fetchStats: () => void;
    getExpensesByCategory: (categoryId: string) => EnhancedExpense[];
    getExpensesByDateRange: (start: Date, end: Date) => EnhancedExpense[];
    getExpensesByVendor: (vendor: string) => EnhancedExpense[];

    clearError: () => void;
}

const generateId = () => `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useEnhancedExpenseStore = create<EnhancedExpenseState>()(
    persist(
        (set, get) => ({
            expenses: [],
            isLoading: false,
            error: null,
            monthlyTotal: 0,
            categoryTotals: {},

            addExpense: (input: CreateEnhancedExpenseInput) => {
                const id = generateId();
                const now = new Date();

                // Process items with IDs
                const itemsWithIds: ExpenseItem[] = input.items.map((item) => ({
                    ...item,
                    id: generateItemId(),
                }));

                const newExpense: EnhancedExpense = {
                    id,
                    userId: 'current-user', // Will be replaced with actual user ID
                    categoryId: input.categoryId,
                    category: input.category,
                    vendor: input.vendor,
                    description: input.description,
                    date: input.date,
                    paymentMethod: input.paymentMethod,
                    items: itemsWithIds,
                    subtotal: input.subtotal,
                    discount: input.discount,
                    taxAmount: input.taxAmount,
                    taxPercent: input.taxPercent,
                    amount: input.amount,
                    metadata: input.metadata,
                    attachments: input.attachments,
                    receiptImageUrl: input.receiptImageUrl,
                    notes: input.notes,
                    tags: input.tags,
                    location: input.location,
                    isAIExtracted: input.isAIExtracted,
                    aiConfidence: input.aiConfidence,
                    createdAt: now,
                    updatedAt: now,
                };

                set((state) => ({
                    expenses: [newExpense, ...state.expenses],
                }));

                // Update stats
                get().fetchStats();

                return id;
            },

            updateExpense: (input: UpdateEnhancedExpenseInput) => {
                set((state) => {
                    const updatedExpenses = state.expenses.map((e) => {
                        if (e.id !== input.id) return e;

                        // Process items with IDs if provided
                        let processedItems = e.items;
                        if (input.items) {
                            processedItems = input.items.map((item) => ({
                                ...item,
                                id: generateItemId(),
                            }));
                        }

                        return {
                            ...e,
                            ...input,
                            items: processedItems,
                            updatedAt: new Date(),
                        };
                    });

                    return { expenses: updatedExpenses };
                });
                get().fetchStats();
            },

            deleteExpense: (id: string) => {
                set((state) => ({
                    expenses: state.expenses.filter((e) => e.id !== id),
                }));
                get().fetchStats();
            },

            getExpenseById: (id: string) => {
                return get().expenses.find((e) => e.id === id);
            },

            addMultipleExpenses: (inputs: CreateEnhancedExpenseInput[]) => {
                const ids: string[] = [];
                const now = new Date();

                const newExpenses: EnhancedExpense[] = inputs.map((input) => {
                    const id = generateId();
                    ids.push(id);

                    const itemsWithIds: ExpenseItem[] = input.items.map((item) => ({
                        ...item,
                        id: generateItemId(),
                    }));

                    return {
                        id,
                        userId: 'current-user',
                        categoryId: input.categoryId,
                        category: input.category,
                        vendor: input.vendor,
                        description: input.description,
                        date: input.date,
                        paymentMethod: input.paymentMethod,
                        items: itemsWithIds,
                        subtotal: input.subtotal,
                        discount: input.discount,
                        taxAmount: input.taxAmount,
                        taxPercent: input.taxPercent,
                        amount: input.amount,
                        metadata: input.metadata,
                        attachments: input.attachments,
                        receiptImageUrl: input.receiptImageUrl,
                        notes: input.notes,
                        tags: input.tags,
                        location: input.location,
                        isAIExtracted: input.isAIExtracted,
                        aiConfidence: input.aiConfidence,
                        createdAt: now,
                        updatedAt: now,
                    };
                });

                set((state) => ({
                    expenses: [...newExpenses, ...state.expenses],
                }));

                get().fetchStats();
                return ids;
            },

            fetchStats: () => {
                const expenses = get().expenses;
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                // Monthly total
                const monthlyTotal = expenses
                    .filter((e) => new Date(e.date) >= startOfMonth)
                    .reduce((sum, e) => sum + e.amount, 0);

                // Category totals
                const categoryTotals: Record<string, number> = {};
                expenses.forEach((e) => {
                    categoryTotals[e.categoryId] = (categoryTotals[e.categoryId] || 0) + e.amount;
                });

                set({ monthlyTotal, categoryTotals });
            },

            getExpensesByCategory: (categoryId: string) => {
                return get().expenses.filter((e) => e.categoryId === categoryId);
            },

            getExpensesByDateRange: (start: Date, end: Date) => {
                return get().expenses.filter((e) => {
                    const date = new Date(e.date);
                    return date >= start && date <= end;
                });
            },

            getExpensesByVendor: (vendor: string) => {
                return get().expenses.filter((e) =>
                    e.vendor.toLowerCase().includes(vendor.toLowerCase())
                );
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'eleviq-enhanced-expenses',
            partialize: (state) => ({ expenses: state.expenses }),
        }
    )
);

// Helper hooks
export const useEnhancedExpenses = () => useEnhancedExpenseStore((state) => state.expenses);
export const useMonthlyTotal = () => useEnhancedExpenseStore((state) => state.monthlyTotal);
export const useCategoryTotals = () => useEnhancedExpenseStore((state) => state.categoryTotals);
