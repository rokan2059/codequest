import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import TrophyIcon from './icons/TrophyIcon';
import PuzzleIcon from './icons/PuzzleIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import { useAppContext } from '../context/AppContext';
import CertificateModal from './CertificateModal';
import { uploadFile } from '../lib/storageService';
import * as Auth from '../lib/auth';

interface ProfileProps {
    userId?: string;
    onClose?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ userId, onClose }) => {
    const { state, dispatch, addToast } = useAppContext();
    const { players, achievements } = state;
    
    const displayUser = userId ? players.find(p => p.id === userId) : state.user;
    const [showCertificate, setShowCertificate] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    if (!displayUser) return null;

    const sortedPlayers = [...players].filter(p => p.role !== 'admin').sort((a, b) => b.points - a.points);
    const userRank = sortedPlayers.findIndex(p => p.id === displayUser.id) + 1;
    
    const userAchievementIds = displayUser.achievements || [];
    const xpProgress = displayUser.xpToNextLevel > 0 ? (displayUser.xp / displayUser.xpToNextLevel) * 100 : 0;

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !state.user) return;

        try {
            setIsUploading(true);
            const bucket = 'avatars'; // Use avatars bucket
            const path = `avatar_${state.user.id}_${Date.now()}`;
            const url = await uploadFile(bucket, path, file);
            
            const updatedUser = { ...state.user, avatarUrl: url };
            await Auth.updateUser(updatedUser);
            dispatch({ type: 'LOGIN_SUCCESS', payload: updatedUser });
            addToast('Profile picture updated!');
        } catch (error: any) {
            console.error('Avatar upload failed:', error);
            addToast('Upload failed: ' + (error.message || 'Unknown error'), 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const isOwnProfile = !userId || (state.user && state.user.id === userId);

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
                <div className="relative inline-block group">
                    <div className="w-24 h-24 rounded-full bg-sky-500/20 mx-auto flex items-center justify-center border-2 border-sky-400 mb-4 overflow-hidden">
                        {displayUser.avatarUrl ? (
                            <img src={displayUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold text-slate-100">{(displayUser.username || displayUser.email).charAt(0).toUpperCase()}</span>
                        )}
                        {isUploading && (
                            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        )}
                    </div>
                    {isOwnProfile && !isUploading && (
                        <>
                            <input 
                                type="file" 
                                ref={avatarInputRef}
                                onChange={handleAvatarUpload}
                                className="hidden"
                                accept="image/*"
                            />
                            <button 
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute bottom-4 right-0 p-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-full shadow-lg border border-slate-900 transition-all opacity-0 group-hover:opacity-100"
                                title="Change Profile Picture"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </button>
                        </>
                    )}
                </div>
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-4xl font-bold text-slate-100 flex items-center gap-2">
                        {displayUser.username || 'Challenger'}
                    </h1>
                </div>
                <p className="text-lg text-slate-400 mt-2">Level {displayUser.level} {displayUser.role === 'admin' ? '(Admin)' : ''}</p>
                <div className="mt-6">
                    <button 
                        onClick={() => setShowCertificate(true)}
                        className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2 mx-auto uppercase tracking-wide text-sm border-2 border-yellow-400/50"
                    >
                        <svg className="w-5 h-5 text-yellow-200" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        View Certificate
                    </button>
                </div>
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
                    {achievements.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {achievements.map((ach) => {
                                const isUnlocked = userAchievementIds.includes(ach.id);
                                return (
                                    <div 
                                        key={ach.id} 
                                        title={`${ach.name}: ${ach.description}`} 
                                        className={`flex flex-col items-center text-center p-4 rounded-lg border transition-all duration-300 aspect-square justify-center relative group
                                            ${isUnlocked 
                                                ? 'bg-slate-900/50 border-slate-700 hover:border-sky-500/50' 
                                                : 'bg-slate-900/20 border-slate-800 grayscale opacity-60'
                                            }`}
                                    >
                                        {!isUnlocked && (
                                            <div className="absolute top-2 right-2 text-slate-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                            </div>
                                        )}
                                        {ach.imageUrl ? (
                                            <img src={ach.imageUrl} alt={ach.name} className="w-16 h-16 object-cover rounded-full mb-2" />
                                        ) : (
                                            <div className="text-5xl mb-2">{ach.icon}</div>
                                        )}
                                        <h3 className={`font-bold text-sm ${isUnlocked ? 'text-slate-100' : 'text-slate-500'}`}>{ach.name}</h3>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">
                                            {isUnlocked ? 'Unlocked' : `Requires ${ach.requiredPuzzles} Puzzles`}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-8">No achievements available yet.</p>
                    )}
                </div>
            </div>

            {showCertificate && (
                <CertificateModal 
                    user={displayUser} 
                    onClose={() => setShowCertificate(false)} 
                />
            )}
        </div>
    );
};

export default Profile;