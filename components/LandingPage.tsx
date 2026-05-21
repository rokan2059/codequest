import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
            {/* Global background wallpaper with low subtle opacity */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.05] pointer-events-none mix-blend-screen z-0"
                style={{ backgroundImage: "url('/code-design-creative-wallpaper-featuring-intricate-patterns-computer-code-technology-art-to-offer-modern-code-design-355060656.webp')" }}
            />

            {/* Minimal Header */}
            <header className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-md z-50 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div 
                        className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-2 cursor-pointer"
                        onClick={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })}
                    >
                        CodeQuest
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={navigateToLogin}
                            className="text-sm font-medium border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-lg transition-colors"
                        >
                            {state.user ? 'Enter Arena' : 'Login / Register'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative z-10">
                <section className="relative pt-32 pb-16 md:pt-44 md:pb-20 overflow-hidden">
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950/90 to-slate-950 z-0"></div>
                    
                    {/* Highly aesthetic hero image overlay */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.16] pointer-events-none mix-blend-color-dodge z-0"
                        style={{ backgroundImage: "url('/code-design-creative-wallpaper-featuring-intricate-patterns-computer-code-technology-art-to-offer-modern-code-design-355060656.webp')" }}
                    />
                    
                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                        <motion.div
                             initial={{ opacity: 0, y: 15 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ duration: 0.4 }}
                        >
                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                                CodeQuest.<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
                                    Every Puzzle is a Battle.
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                                Gain EXP, unlock higher levels, and earn leaderboard points by conquering coding challenges.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <button 
                                    onClick={navigateToLogin}
                                    className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] cursor-pointer"
                                >
                                   Start Challenger Journey <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button 
                                    onClick={navigateToPuzzles}
                                    className="w-full sm:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors border border-slate-700 cursor-pointer"
                                >
                                    Browse Puzzle Vault
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-slate-800 bg-slate-950 text-center relative z-20">
                <p className="text-slate-500 text-sm">
                    &copy; {new Date().getFullYear()} CodeQuest. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
