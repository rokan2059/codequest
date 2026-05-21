import React from 'react';
import PuzzleIcon from './icons/PuzzleIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import LogoutIcon from './icons/LogoutIcon';
import { useAppContext } from '../context/AppContext';
import PuzzleManagement from './admin/PuzzleManagement';
import CategoryManagement from './admin/CategoryManagement';
import PlayerManagement from './admin/PlayerManagement';
import AdminLeaderboard from './admin/AdminLeaderboard';
import AchievementManagement from './admin/AchievementManagement';
import SettingsManagement from './admin/SettingsManagement';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
    const { state, logout, dispatch } = useAppContext();
    const { user, adminView } = state;

    // Gracefully handle the exit transition where user might be null
    if (!user) {
        return <div className="min-h-screen bg-slate-900"></div>;
    }

    // Security Check: Redirect if not admin
    if (user.role !== 'admin') {
        logout(); // Force logout or you could return a redirect component
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Access Denied</div>;
    }

    const setAdminView = (view: 'main' | 'puzzle_management' | 'category_management' | 'player_management' | 'achievement_management' | 'settings_management' | 'leaderboard') => {
        dispatch({ type: 'SET_ADMIN_VIEW', payload: view });
    };

    if (adminView === 'puzzle_management') return <PuzzleManagement />;
    if (adminView === 'category_management') return <CategoryManagement />;
    if (adminView === 'player_management') return <PlayerManagement />;
    if (adminView === 'achievement_management') return <AchievementManagement />;
    if (adminView === 'settings_management') return <SettingsManagement />;
    if (adminView === 'leaderboard') return <AdminLeaderboard />;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">Admin Dashboard</h1>
                    <p className="text-slate-400">Logged in as: {user.username || 'Admin'}</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500 transition-all duration-300"
                >
                    <LogoutIcon className="w-5 h-5" />
                    <span>Log Out</span>
                </motion.button>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700 hover:border-sky-500 transition-colors duration-300">
                    <div className="flex items-center gap-4 mb-4">
                        <PuzzleIcon className="w-8 h-8 text-sky-400" />
                        <h2 className="text-xl font-semibold text-slate-100">Puzzle Management</h2>
                    </div>
                    <p className="text-slate-400 mb-4">
                        Create, edit, and delete coding challenges. Organize them into categories and set difficulty levels.
                    </p>
                    <button 
                        onClick={() => setAdminView('puzzle_management')}
                        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Manage Challenges
                    </button>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700 hover:border-purple-500 transition-colors duration-300">
                    <div className="flex items-center gap-4 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-slate-100">Category Management</h2>
                    </div>
                    <p className="text-slate-400 mb-4">
                        Create, rename, and delete the categories used to group challenges for players.
                    </p>
                    <button 
                        onClick={() => setAdminView('category_management')}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Manage Categories
                    </button>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700 hover:border-green-500 transition-colors duration-300">
                    <div className="flex items-center gap-4 mb-4">
                        <UserCircleIcon className="w-8 h-8 text-green-400" />
                        <h2 className="text-xl font-semibold text-slate-100">Player Management</h2>
                    </div>
                    <p className="text-slate-400 mb-4">
                        View player progress, achievements, and statistics. Monitor overall engagement.
                    </p>
                    <button onClick={() => setAdminView('player_management')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        View Players
                    </button>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700 hover:border-yellow-500 transition-colors duration-300">
                    <div className="flex items-center gap-4 mb-4">
                        <ChartBarIcon className="w-8 h-8 text-yellow-400" />
                        <h2 className="text-xl font-semibold text-slate-100">Leaderboard</h2>
                    </div>
                    <p className="text-slate-400 mb-4">
                        View the global player rankings and verify filtering for administrators.
                    </p>
                    <button onClick={() => setAdminView('leaderboard')} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Leaderboard
                    </button>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700 hover:border-orange-500 transition-colors duration-300">
                    <div className="flex items-center gap-4 mb-4">
                        <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        <h2 className="text-xl font-semibold text-slate-100">Player Achievements</h2>
                    </div>
                    <p className="text-slate-400 mb-4">
                        Create new achievements for players to earn while they solve challenges.
                    </p>
                    <button onClick={() => setAdminView('achievement_management')} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Manage Achievements
                    </button>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700 hover:border-slate-500 transition-colors duration-300">
                    <div className="flex items-center gap-4 mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <h2 className="text-xl font-semibold text-slate-100">Settings</h2>
                    </div>
                    <p className="text-slate-400 mb-4">
                        Configure certificate requirements and other platform settings.
                    </p>
                    <button onClick={() => setAdminView('settings_management')} className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors mt-auto">
                        Open Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;