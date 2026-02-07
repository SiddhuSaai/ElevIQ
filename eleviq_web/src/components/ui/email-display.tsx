'use client';

import { cn } from '@/lib/utils/cn';

interface EmailDisplayProps {
    email: string;
    onChangeEmail: () => void;
    className?: string;
}

export function EmailDisplay({ email, onChangeEmail, className }: EmailDisplayProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white',
                className
            )}
        >
            <span className="text-gray-900 truncate">{email}</span>
            <button
                type="button"
                onClick={onChangeEmail}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm ml-4 flex-shrink-0"
            >
                Change email
            </button>
        </div>
    );
}
