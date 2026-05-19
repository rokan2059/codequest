import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import * as Auth from '../lib/auth';
import LogoIcon from './icons/LogoIcon';

const ResetPassword: React.FC = () => {
    const { addToast, dispatch } = useAppContext();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            addToast('Passwords do not match', 'error');
            return;
        }
        if (password.length < 6) {
            addToast('Password must be at least 6 characters', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await Auth.updatePassword(password);
            addToast('Password updated successfully!', 'success');
            // Check if they have a role to redirect correctly
            const loggedInUser = await Auth.getLoggedInUser();
            if (loggedInUser) {
                dispatch({ type: 'LOGIN_SUCCESS', payload: loggedInUser });
                if (loggedInUser.role === 'admin') {
                    dispatch({ type: 'SET_VIEW', payload: 'admin_dashboard' });
                } else {
                    dispatch({ type: 'SET_VIEW', payload: 'player_dashboard' });
                }
            } else {
                dispatch({ type: 'SET_VIEW', payload: 'login' });
            }
        } catch (error: any) {
            addToast(error.message || 'Error updating password', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-800"
            >
                <div className="flex flex-col items-center gap-4 mb-8">
                    <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500 font-mono tracking-tight">Code<span className="text-secondary">Quest</span></span>
                    <h1 className="text-3xl font-bold text-slate-100">Reset Password</h1>
                    <p className="text-slate-400 text-center">Enter your new password below.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all pr-10"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all pr-10"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => dispatch({ type: 'SET_VIEW', payload: 'login' })}
                        className="w-full text-slate-400 hover:text-slate-300 text-sm transition-all"
                    >
                        Back to Login
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
