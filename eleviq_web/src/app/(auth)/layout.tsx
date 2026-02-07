'use client';

import Link from 'next/link';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {/* Desktop: Dark background, Mobile: White background */}
            <div className="min-h-screen flex flex-col bg-white lg:bg-[#0a0a0a]">
                {/* Main Content */}
                <div className="flex-1 flex items-center justify-center px-4 py-8 lg:py-16">
                    <div className="w-full max-w-[440px]">
                        {/* Logo - Different positioning for mobile vs desktop */}
                        <div className="mb-8 lg:mb-10 lg:text-center">
                            <Link href="/" className="inline-flex items-center gap-2">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="w-6 h-6 lg:w-7 lg:h-7 text-white"
                                        fill="currentColor"
                                    >
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                                <span className="text-xl lg:hidden font-bold text-gray-900">
                                    ELEVIQ
                                </span>
                            </Link>
                        </div>

                        {/* Card wrapper - Only on desktop */}
                        <div className="lg:bg-white lg:rounded-2xl lg:shadow-2xl lg:p-8">
                            {children}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500 lg:text-gray-400">
                        <span className="lg:hidden">
                            Help{' '}
                            <span className="mx-2">·</span>
                            Privacy{' '}
                            <span className="mx-2">·</span>
                            Terms
                        </span>
                        <span className="hidden lg:block">Need Help?</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-400 lg:text-gray-500">
                        By continuing, you agree to the{' '}
                        <Link href="/terms" className="text-blue-600 hover:underline">
                            Terms
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-blue-600 hover:underline">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </footer>
            </div>
        </>
    );
}
