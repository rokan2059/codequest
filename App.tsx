import React from 'react';
import { AnimatePresence, motion, Transition } from 'framer-motion';
import { useAppContext } from './context/AppContext';

import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import PlayerLayout from './components/PlayerLayout';
import ToastContainer from './components/ToastContainer';
import ResetPassword from './components/ResetPassword';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
};

const pageTransition: Transition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
};

const App: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { user } = state;

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        
        const verifyId = params.get('verify_cert');
        if (verifyId) {
            dispatch({ type: 'SET_VIEW', payload: 'verify_cert' });
        }
        
        const isReset = params.get('reset') === 'true';
        if (isReset || window.location.hash.includes('type=recovery')) {
            dispatch({ type: 'SET_VIEW', payload: 'reset_password' });
            
            // Carefully clean up only the reset param so Supabase can still read 'code'
            params.delete('reset');
            const newSearch = params.toString() ? `?${params.toString()}` : '';
            window.history.replaceState(null, '', `${window.location.pathname}${newSearch}${window.location.hash.replace(/type=recovery&?/, '')}`);
        }
    }, [dispatch]);

    if (!state.isInitialized) {
        return (
            <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-slate-400 font-medium animate-pulse">loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-background">
            <AnimatePresence mode="wait">
                {state.view === 'landing' ? (
                    <motion.div
                        key="landing"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="w-full"
                    >
                        <LandingPage />
                    </motion.div>
                ) : state.view === 'login' ? (
                    <motion.div
                        key="login"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="w-full"
                    >
                        <LoginPage />
                    </motion.div>
                ) : state.view === 'reset_password' ? (
                    <motion.div
                        key="reset_password"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="w-full"
                    >
                        <ResetPassword />
                    </motion.div>
                ) : state.view === 'verify_cert' ? (
                    <motion.div
                        key="verify_cert"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="w-full"
                    >
                        {/* We need VerifyCertificate here but I'll import it in next step */}
                        <PlayerLayout /> {/* We can let PlayerLayout handle verify_cert for now, or just extract it. I will let PlayerLayout handle verify_cert but fix authentication */}
                    </motion.div>
                ) : user && user.role === 'admin' ? (
                    <motion.div
                        key="admin"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="w-full"
                    >
                        <AdminDashboard />
                    </motion.div>
                ) : (user || state.view === 'puzzles' || state.view === 'leaderboard') ? (
                    <motion.div
                        key="player"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="w-full"
                    >
                        <PlayerLayout />
                    </motion.div>
                ) : (
                    <motion.div
                        key="landing"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="w-full"
                    >
                        <LandingPage />
                    </motion.div>
                )}
            </AnimatePresence>
            <ToastContainer />
        </div>
    );
};

export default App;