import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    User,
    UserCredential,
} from 'firebase/auth';
import { auth } from './config';

export class AuthService {
    // Check if auth is available
    private static checkAuth() {
        if (!auth) {
            throw new Error('Firebase Auth is not initialized. Please configure Firebase credentials.');
        }
        return auth;
    }

    // Sign up with email and password
    static async signUpWithEmail(
        email: string,
        password: string,
        displayName?: string
    ): Promise<UserCredential> {
        const firebaseAuth = this.checkAuth();

        try {
            const credential = await createUserWithEmailAndPassword(
                firebaseAuth,
                email,
                password
            );

            // Update display name if provided
            if (displayName && credential.user) {
                await updateProfile(credential.user, { displayName });
            }

            console.log('✅ User signed up:', credential.user.email);
            return credential;
        } catch (error: any) {
            console.error('❌ Sign up error:', error.message);
            throw error;
        }
    }

    // Sign in with email and password
    static async signInWithEmail(
        email: string,
        password: string
    ): Promise<UserCredential> {
        const firebaseAuth = this.checkAuth();

        try {
            const credential = await signInWithEmailAndPassword(
                firebaseAuth,
                email,
                password
            );
            console.log('✅ User signed in:', credential.user.email);
            return credential;
        } catch (error: any) {
            console.error('❌ Sign in error:', error.message);
            throw error;
        }
    }

    // Sign out
    static async signOut(): Promise<void> {
        const firebaseAuth = this.checkAuth();

        try {
            await signOut(firebaseAuth);
            console.log('✅ User signed out');
        } catch (error: any) {
            console.error('❌ Sign out error:', error.message);
            throw error;
        }
    }

    // Password reset
    static async resetPassword(email: string): Promise<void> {
        const firebaseAuth = this.checkAuth();

        try {
            await sendPasswordResetEmail(firebaseAuth, email);
            console.log('✅ Password reset email sent to:', email);
        } catch (error: any) {
            console.error('❌ Password reset error:', error.message);
            throw error;
        }
    }

    // Get current user
    static getCurrentUser(): User | null {
        return auth?.currentUser || null;
    }

    // Get error message from Firebase error
    static getErrorMessage(error: any): string {
        const errorString = error?.message || error?.toString() || '';

        if (errorString.includes('not initialized')) {
            return 'Firebase is not configured. Please add your Firebase credentials.';
        }

        const code = error?.code || '';

        switch (code) {
            case 'auth/email-already-in-use':
                return 'An account already exists with this email';
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/user-not-found':
                return 'No account found with this email';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/weak-password':
                return 'Password is too weak';
            case 'auth/network-request-failed':
                return 'Network error. Please check your connection';
            case 'auth/too-many-requests':
                return 'Too many attempts. Please try again later';
            default:
                return error?.message || 'An error occurred. Please try again';
        }
    }
}
