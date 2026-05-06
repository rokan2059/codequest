import React, { useState } from 'react';
import LogoIcon from './icons/LogoIcon';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

const LoginPage: React.FC = () => {
    const { login, signup, addToast, dispatch } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [adminSecret, setAdminSecret] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);

    const validateEmail = (email: string) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleForgotPasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email) {
            addToast('Please enter your email address.', 'error');
            return;
        }
        if (!validateEmail(email)) {
            addToast('Please enter a valid email address.', 'error');
            return;
        }
        setIsLoading(true);
        
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin,
            });
            
            if (error) throw error;
            
            addToast('If an account exists with this email, you will receive a password reset link.', 'success');
            setIsForgotPassword(false);
        } catch (error: any) {
            addToast(error.message || 'Error sending reset link', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignInSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email || !password) {
            addToast('Please enter both email and password.', 'error');
            return;
        }
        setIsLoading(true);
        
        // Dev Admin Hardcoded Credentials Check
        if (email === 'dev@admin.com' && password === 'devadminsecret') {
            const adminUser = {
                id: 9999,
                email: 'dev@admin.com',
                password: 'devadminsecret',
                role: 'admin' as const,
                points: 99999,
                xp: 99999,
                level: 99,
                xpToNextLevel: 0,
                solvedPuzzleIds: [],
                achievements: []
            };
            addToast('Logged in as Dev Admin!');
            dispatch({ type: 'LOGIN_SUCCESS', payload: adminUser });
            setIsLoading(false);
            return;
        }

        const result = await login(email, password);
        setIsLoading(false);

        if (result.success && result.user) {
            addToast(result.message);
            dispatch({ type: 'LOGIN_SUCCESS', payload: result.user });
        } else {
            addToast(result.message, 'error');
        }
    };
    
    const handleSignUpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email || !password || !confirmPassword) {
            addToast('Please fill in all fields.', 'error');
            return;
        }
        if (!validateEmail(email)) {
            addToast('Please enter a valid email address.', 'error');
            return;
        }
        if (password.length < 6) {
            addToast('Password must be at least 6 characters long.', 'error');
            return;
        }
        if (password !== confirmPassword) {
            addToast('Passwords do not match.', 'error');
            return;
        }

        setIsLoading(true);
        const result = await signup(email, password, adminSecret);
        setIsLoading(false);

        if (result.success) {
            addToast(result.message);
            setIsSigningUp(false);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } else {
            addToast(result.message, 'error');
        }
    };

    const toggleFormMode = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsSigningUp(!isSigningUp);
        // Reset form fields
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md bg-background backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6 border border-primary">
                <div className="flex flex-col items-center space-y-4">
                    <LogoIcon />
                    <h1 className="text-3xl font-bold text-gray-100">
                        {isForgotPassword ? 'Reset Password' : (isSigningUp ? 'Create Account' : 'Welcome Back')}
                    </h1>
                    <p className="text-gray-400 text-center">
                        {isForgotPassword 
                            ? 'Enter your email to receive a reset link' 
                            : (isSigningUp ? 'Join the CodeQuest Arena and start solving puzzles.' : 'Sign in to access your dashboard')}
                    </p>
                </div>

                <form className="space-y-6" onSubmit={isForgotPassword ? handleForgotPasswordSubmit : (isSigningUp ? handleSignUpSubmit : handleSignInSubmit)}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-900 border border-primary rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition duration-200"
                            placeholder="you@example.com"
                        />
                    </div>

                    {!isForgotPassword && (
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete={isSigningUp ? "new-password" : "current-password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-neutral-900 border border-primary rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition duration-200"
                                placeholder="••••••••"
                            />
                            {isSigningUp && (
                                <p className="mt-1 text-xs text-gray-500">Min. 6 characters</p>
                            )}
                        </div>
                    )}
                    
                    {isSigningUp && !isForgotPassword && (
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full px-4 py-3 bg-neutral-900 border ${password && confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-primary'} rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition duration-200`}
                                placeholder="••••••••"
                            />
                            {password && confirmPassword && password !== confirmPassword && (
                                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                            )}
                        </div>
                    )}

                    {isSigningUp && !isForgotPassword && (
                        <div>
                            <label htmlFor="admin-secret" className="block text-sm font-medium text-gray-300 mb-2">
                                Admin Secret (Optional)
                            </label>
                            <input
                                id="admin-secret"
                                name="admin-secret"
                                type="password"
                                value={adminSecret}
                                onChange={(e) => setAdminSecret(e.target.value)}
                                className="w-full px-4 py-3 bg-neutral-900 border border-primary rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition duration-200"
                                placeholder="For administrators only"
                            />
                        </div>
                    )}
                    
                    {!isSigningUp && !isForgotPassword && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 bg-neutral-900 border-primary text-secondary focus:ring-secondary rounded" />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                                    Remember me
                                </label>
                            </div>
                            <div className="text-sm">
                                <button type="button" onClick={() => setIsForgotPassword(true)} className="font-medium text-secondary hover:text-green-700 transition-colors bg-transparent border-none p-0 cursor-pointer">
                                    Forgot password?
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 bg-primary hover:bg-red-900 focus:ring-primary`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                isForgotPassword ? 'Send Reset Link' : (isSigningUp ? 'Sign Up' : 'Sign In')
                            )}
                        </button>
                    </div>

                    {isForgotPassword && (
                         <div className="text-center">
                            <button type="button" onClick={() => setIsForgotPassword(false)} className="text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors">
                                Back to Sign In
                            </button>
                         </div>
                    )}
                </form>

                 <p className="text-center text-sm text-gray-500 !mt-8">
                     {isSigningUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button onClick={toggleFormMode} className="font-medium text-secondary hover:text-green-700 transition-colors bg-transparent border-none p-0 cursor-pointer focus:outline-none">
                        {isSigningUp ? 'Sign in' : 'Sign up'}
                    </button>
                </p>

                <div className="relative !mt-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-800 text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div className="flex justify-center mt-6">
                     <p className="text-xs text-gray-500">Secure Admin Portal Access Required for Advanced Features</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;