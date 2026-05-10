import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TrophyIcon from './icons/TrophyIcon';
import PuzzleIcon from './icons/PuzzleIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import { useAppContext } from '../context/AppContext';
import { makeUserAdmin } from '../lib/auth';

interface ProfileProps {
    userId?: string;
    onClose?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ userId, onClose }) => {
    const { state, dispatch, addToast } = useAppContext();
    const { players, achievements } = state;
    
    const displayUser = userId ? players.find(p => p.id === userId) : state.user;
    const [isUpgrading, setIsUpgrading] = useState(false);

    if (!displayUser) return null;

    const sortedPlayers = [...players].filter(p => p.role === 'player').sort((a, b) => b.points - a.points);
    const userRank = sortedPlayers.findIndex(p => p.id === displayUser.id) + 1;
    
    const userAchievements = achievements.filter(ach => displayUser.achievements.includes(ach.id));
    const xpProgress = displayUser.xpToNextLevel > 0 ? (displayUser.xp / displayUser.xpToNextLevel) * 100 : 0;

    const handleMakeAdmin = async () => {
        setIsUpgrading(true);
        try {
            await makeUserAdmin(displayUser.id);
            addToast('Upgraded profile to Admin! Logging you back in automatically...', 'success');
            // Optimistically update context to see the admin view instantly
            dispatch({ type: 'LOGIN_SUCCESS', payload: { ...displayUser, role: 'admin' } });
        } catch (error: any) {
            addToast('Failed to make you an admin.', 'error');
        } finally {
            setIsUpgrading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-4xl relative">
            {onClose && (
                <button 
                    onClick={onClose} 
                    className="absolute top-0 right-0 p-2 text-slate-400 hover:text-white transition-colors"
                    title="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            )}
            <div className="text-center mb-10 pt-4">
                <div className="w-24 h-24 rounded-full bg-sky-500/20 mx-auto flex items-center justify-center border-2 border-sky-400 mb-4">
                     <span className="text-4xl font-bold text-slate-100">{displayUser.email.charAt(0).toUpperCase()}</span>
                </div>
                <h1 className="text-4xl font-bold text-slate-100">{displayUser.email}</h1>
                <p className="text-lg text-slate-400">Level {displayUser.level} {displayUser.role === 'admin' ? '(Admin)' : ''}</p>
                {displayUser.role !== 'admin' && !userId && (
                    <button 
                        onClick={handleMakeAdmin}
                        disabled={isUpgrading}
                        className="mt-4 text-xs bg-red-900/40 hover:bg-red-800 text-red-200 py-1 px-3 rounded border border-red-800/50 transition-colors"
                    >
                        {isUpgrading ? 'Upgrading...' : 'Make Me Admin (Dev Only)'}
                    </button>
                )}
            </div>

            {/* XP Bar */}
            <div className="mb-10 px-4">
                <div className="flex justify-between text-sm text-slate-400 mb-1">
                    <span>XP: {displayUser.xp} / {displayUser.xpToNextLevel}</span>
                    <span>Next Level</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <motion.div
                        className="bg-sky-500 h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
                    <PuzzleIcon className="w-10 h-10 mx-auto text-sky-400 mb-2" />
                    <p className="text-3xl font-bold text-slate-100">{displayUser.solvedPuzzleIds ? displayUser.solvedPuzzleIds.length : 0}</p>
                    <p className="text-slate-400">Puzzles Solved</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
                    <TrophyIcon className="w-10 h-10 mx-auto text-yellow-400 mb-2" />
                    <p className="text-3xl font-bold text-slate-100">{displayUser.points}</p>
                    <p className="text-slate-400">Total Points</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
                    <ChartBarIcon className="w-10 h-10 mx-auto text-green-400 mb-2" />
                    <p className="text-3xl font-bold text-slate-100">{userRank > 0 ? `#${userRank}`: 'N/A'}</p>
                    <p className="text-slate-400">Current Rank</p>
                </div>
            </div>

            {/* Achievements Section */}
            <div>
                <h2 className="text-2xl font-semibold text-slate-100 mb-4">Achievements</h2>
                <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 p-6">
                    {userAchievements.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {userAchievements.map((ach) => (
                                <div key={ach.id} title={`${ach.name}: ${ach.description}`} className="flex flex-col items-center text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700 aspect-square justify-center">
                                {ach.imageUrl ? (
                                    <img src={ach.imageUrl} alt={ach.name} className="w-16 h-16 object-cover rounded-full mb-2" />
                                ) : (
                                    <div className="text-5xl mb-2">{ach.icon}</div>
                                )}
                                <h3 className="font-bold text-slate-100 text-sm">{ach.name}</h3>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-8">Solve more puzzles to unlock achievements!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;