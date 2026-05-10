import React from 'react';
import { AnimatePresence, motion, Transition } from 'framer-motion';
import { useAppContext } from './context/AppContext';

import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import PlayerLayout from './components/PlayerLayout';
import ToastContainer from './components/ToastContainer';

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
    }, [dispatch]);

    return (
        <div className="min-h-screen w-full bg-background">
            <AnimatePresence mode="wait">
                {user && user.role === 'admin' ? (
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