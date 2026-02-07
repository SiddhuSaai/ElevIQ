'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SocialButton } from '@/components/ui/social-button';
import { Divider } from '@/components/ui/divider';
import { EmailDisplay } from '@/components/ui/email-display';
import { AuthService } from '@/lib/firebase/auth';
import { useAuthStore } from '@/store/auth-store';

// Step 1: Email only
const emailSchema = z.object({
    email: z.string().email('Please enter a valid email'),
});

// Step 2: Name and Password
const detailsSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type DetailsFormData = z.infer<typeof detailsSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setUser } = useAuthStore();

    // Step 1 form
    const emailForm = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
    });

    // Step 2 form
    const detailsForm = useForm<DetailsFormData>({
        resolver: zodResolver(detailsSchema),
    });

    const handleEmailSubmit = async (data: EmailFormData) => {
        setEmail(data.email);
        setStep(2);
        setError(null);
    };

    const handleDetailsSubmit = async (data: DetailsFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const credential = await AuthService.signUpWithEmail(
                email,
                data.password,
                data.name
            );
            setUser(credential.user);
            router.push('/onboarding');
        } catch (err: any) {
            setError(AuthService.getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const credential = await AuthService.signInWithGoogle();
            setUser(credential.user);
            router.push('/onboarding');
        } catch (err: any) {
            setError(AuthService.getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeEmail = () => {
        setStep(1);
        setError(null);
        detailsForm.reset();
    };

    return (
        <div>
            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                {step === 1 ? 'Create a ELEVIQ account' : 'Complete your account'}
            </h1>
            <p className="text-gray-500 mb-6">
                {step === 1
                    ? 'One last step before getting started.'
                    : 'Enter your details to continue.'}
            </p>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                </div>
            )}

            {step === 1 ? (
                // Step 1: Email Entry
                <>
                    <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email address
                            </label>
                            <Input
                                {...emailForm.register('email')}
                                type="email"
                                placeholder="Enter your email"
                                className="h-12"
                                error={emailForm.formState.errors.email?.message}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-black hover:bg-gray-800 text-white"
                            isLoading={isLoading}
                        >
                            Continue with email
                        </Button>
                    </form>

                    <Divider />

                    {/* Social Buttons - Full width with text */}
                    <div className="space-y-3">
                        <SocialButton
                            provider="google"
                            variant="full"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                        >
                            Sign up with Google
                        </SocialButton>
                    </div>

                    {/* Login link */}
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have a ELEVIQ account?{' '}
                        <Link
                            href="/login"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Log in →
                        </Link>
                    </p>
                </>
            ) : (
                // Step 2: Name and Password
                <>
                    <EmailDisplay email={email} onChangeEmail={handleChangeEmail} />

                    <form
                        onSubmit={detailsForm.handleSubmit(handleDetailsSubmit)}
                        className="mt-6 space-y-4"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full name
                            </label>
                            <Input
                                {...detailsForm.register('name')}
                                type="text"
                                placeholder="Enter your full name"
                                className="h-12"
                                error={detailsForm.formState.errors.name?.message}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    {...detailsForm.register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a password"
                                    className="h-12 pr-12"
                                    error={detailsForm.formState.errors.password?.message}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-black hover:bg-gray-800 text-white"
                            isLoading={isLoading}
                        >
                            Create account
                        </Button>
                    </form>
                </>
            )}
        </div>
    );
}
