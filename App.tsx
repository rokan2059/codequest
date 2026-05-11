import React from 'react';
import { AnimatePresence, motion, Transition } from 'framer-motion';
import { useAppContext } from './context/AppContext';

import LoginPage from './components/LoginPage';
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

    return (
        <div className="min-h-screen w-full bg-background">
            <AnimatePresence mode="wait">
                {state.view === 'reset_password' ? (
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
                ) : (
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
                )}
            </AnimatePresence>
            <ToastContainer />
        </div>
    );
};

export default App;