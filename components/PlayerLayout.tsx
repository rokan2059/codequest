
import React from 'react';
import { AnimatePresence, motion, Transition } from 'framer-motion';
import Navbar from './Navbar';
import PlayerDashboard from './PlayerDashboard';
import PuzzleList from './PuzzleList';
import Leaderboard from './Leaderboard';
import Profile from './Profile';
import PuzzleView from './PuzzleView';
import LoginPage from './LoginPage';
import ResetPassword from './ResetPassword';
import VerifyCertificate from './VerifyCertificate';
import { useAppContext } from '../context/AppContext';
import { View } from '../lib/types';

const pageVariants = {
    initial: { opacity: 0, scale: 0.98 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 0.98 },
};

const pageTransition: Transition = {
    type: 'tween',
    ease: 'easeOut',
    duration: 0.3,
};

const PlayerLayout: React.FC = () => {
    const { state, logout, dispatch, selectCategory } = useAppContext();
    const { view, currentPuzzle, user } = state;

    const setView = (v: View) => dispatch({ type: 'SET_VIEW', payload: v });

    const renderView = () => {
        switch(view) {
            case 'login': return <LoginPage />;
            case 'reset_password': return <ResetPassword />;
            case 'verify_cert': return <VerifyCertificate />;
            case 'player_dashboard': return user ? <PlayerDashboard /> : <LoginPage />;
            case 'puzzles': return user ? <PuzzleList /> : <LoginPage />;
            case 'leaderboard': return user ? <Leaderboard /> : <LoginPage />;
            case 'profile': return user ? <Profile /> : <LoginPage />;
            case 'puzzle_view': return user && currentPuzzle ? <PuzzleView puzzle={currentPuzzle} /> : <PuzzleList />;
            default: return user ? <PlayerDashboard /> : <LoginPage />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-white">
            <Navbar 
                userEmail={user?.email} 
                onLogout={user ? logout : undefined} 
                setView={setView} 
                selectCategory={selectCategory}
                activeView={view} 
            />
            <main className="flex-grow p-4 sm:p-6 lg:p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                    >
                        {renderView()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default PlayerLayout;
