import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Award, ArrowRight, Zap, Code } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function LandingPage() {
    const { state, dispatch } = useAppContext();

    const navigateToLogin = () => {
        if (state.user) {
            dispatch({ type: 'SET_VIEW', payload: state.user.role === 'admin' ? 'admin_dashboard' : 'puzzles' });
        } else {
            dispatch({ type: 'SET_VIEW', payload: 'login' });
        }
    };

    const navigateToPuzzles = () => {
        dispatch({ type: 'SET_VIEW', payload: 'puzzles' });
    };

    const navigateToLeaderboard = () => {
        dispatch({ type: 'SET_VIEW', payload: 'leaderboard' });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
            {/* Minimal Header */}
            <header className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-md z-50 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div 
                        className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-2 cursor-pointer"
                        onClick={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })}
                    >
                        <Shield className="text-indigo-400 h-6 w-6" />
                        CodeQuest
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={navigateToLogin}
                            className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors px-4 py-2 rounded-md ml-2"
                        >
                            {state.user ? 'Dashboard' : 'Sign In'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main>
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950"></div>
                    
                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8 border border-indigo-500/20">
                                <Zap className="w-4 h-4" /> The Ultimate Coding Challenge
                            </span>
                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                                Master Code.<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
                                    Conquer Puzzles.
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                                Join the elite ranks of developers. Solve algorithms, crack cryptography, and climb the leaderboard in an immersive cyber environment.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <button 
                                    onClick={navigateToLogin}
                                    className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
                                >
                                   Start now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button 
                                    onClick={navigateToPuzzles}
                                    className="w-full sm:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors border border-slate-700"
                                >
                                    Browse Puzzles
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 bg-slate-900 border-y border-slate-800">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid md:grid-cols-3 gap-8">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="p-6 rounded-2xl bg-slate-950 border border-slate-800"
                            >
                                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6">
                                    <Code className="w-6 h-6 text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-200 mb-3">Real-world Syntax</h3>
                                <p className="text-slate-400">
                                    Write actual code in our embedded editor to solve intricate challenges spanning multiple languages and domains.
                                </p>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="p-6 rounded-2xl bg-slate-950 border border-slate-800"
                            >
                                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6">
                                    <Target className="w-6 h-6 text-cyan-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-200 mb-3">Progression System</h3>
                                <p className="text-slate-400">
                                    Earn XP for every puzzle solved. Level up your profile to unlock harder challenges and exclusive badges.
                                </p>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="p-6 rounded-2xl bg-slate-950 border border-slate-800"
                            >
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
                                    <Award className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-200 mb-3">Global Leaderboards</h3>
                                <p className="text-slate-400">
                                    Compete against developers worldwide. Secure your spot on the hall of fame by maximizing your score and speed.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-slate-800 bg-slate-950 text-center">
                <p className="text-slate-500 text-sm">
                    &copy; {new Date().getFullYear()} CodeQuest Academy. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
