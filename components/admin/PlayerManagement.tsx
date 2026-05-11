import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User } from '../../lib/types';
import UserCircleIcon from '../icons/UserCircleIcon';
import TrophyIcon from '../icons/TrophyIcon';
import PuzzleIcon from '../icons/PuzzleIcon';
import Profile from '../Profile';

const PlayerManagement: React.FC = () => {
    const { state, dispatch, addToast } = useAppContext();
    const { players } = state;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>({ key: 'points', direction: 'desc' });
    const [viewingUserId, setViewingUserId] = useState<string | null>(null);

    const filteredPlayers = useMemo(() => {
        return players.filter(player =>
            player.role === 'player' &&
            player.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [players, searchTerm]);

    const sortedPlayers = useMemo(() => {
        let sortableItems = [...filteredPlayers];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredPlayers, sortConfig]);

    const requestSort = (key: keyof User) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: keyof User) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? '▲' : '▼';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    // Calculate Summary Stats
    const totalPlayers = players.filter(p => p.role === 'player').length;
    const totalPoints = players.reduce((sum, p) => p.role === 'player' ? sum + p.points : sum, 0);
    const totalSolved = players.reduce((sum, p) => p.role === 'player' ? sum + p.solvedPuzzleIds.length : sum, 0);

    if (viewingUserId) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-slate-900 text-white p-4 sm:p-6 lg:p-8 fade-in relative">
                <Profile userId={viewingUserId} onClose={() => setViewingUserId(null)} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-slate-900 text-white p-4 sm:p-6 lg:p-8 fade-in">
            <header className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                 <div className="flex items-center">
                    <button onClick={() => dispatch({ type: 'SET_ADMIN_VIEW', payload: 'main' })} className="mr-4 text-blue-400 hover:text-blue-300 transition-colors font-semibold">
                        &larr; Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-100">Player Management</h1>
                 </div>
                 
                 <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
                     <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 grow justify-center md:grow-0">
                        <UserCircleIcon className="w-5 h-5 text-blue-400 shrink-0" />
                        <span className="font-bold shrink-0">{totalPlayers}</span> <span className="text-sm text-slate-400 shrink-0">Players</span>
                     </div>
                     <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 grow justify-center md:grow-0">
                        <TrophyIcon className="w-5 h-5 text-yellow-400 shrink-0" />
                        <span className="font-bold shrink-0">{totalPoints}</span> <span className="text-sm text-slate-400 shrink-0">Total Points</span>
                     </div>
                     <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 grow justify-center md:grow-0">
                        <PuzzleIcon className="w-5 h-5 text-green-400 shrink-0" />
                        <span className="font-bold shrink-0">{totalSolved}</span> <span className="text-sm text-slate-400 shrink-0">Solved</span>
                     </div>
                 </div>
            </header>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search player by email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                />
            </div>

            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead className="bg-slate-800 text-slate-400 text-sm uppercase font-semibold tracking-wider">
                            <tr>
                                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('email')}>Player {getSortIndicator('email')}</th>
                                <th className="p-4 cursor-pointer hover:text-white transition-colors text-center" onClick={() => requestSort('created_at')}>Joined {getSortIndicator('created_at')}</th>
                                <th className="p-4 cursor-pointer hover:text-white transition-colors text-center" onClick={() => requestSort('level')}>Level {getSortIndicator('level')}</th>
                                <th className="p-4 cursor-pointer hover:text-white transition-colors text-right" onClick={() => requestSort('points')}>Points {getSortIndicator('points')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {sortedPlayers.length > 0 ? (
                                sortedPlayers.map(player => (
                                    <tr 
                                        key={player.id} 
                                        className="hover:bg-slate-800/80 transition-colors group cursor-pointer"
                                        onClick={() => setViewingUserId(player.id)}
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold border border-blue-500/30 shrink-0 overflow-hidden">
                                                    {player.avatarUrl ? (
                                                        <img src={player.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        player.email.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <span className="font-medium text-slate-200">{player.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-slate-400 text-sm font-mono">
                                            {formatDate(player.created_at)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="px-2 py-1 bg-slate-700 rounded text-xs font-bold text-slate-300">
                                                Lvl {player.level}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-mono text-yellow-500 font-bold">
                                            {player.points.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-slate-500">
                                        <p className="text-lg">No players found matching your search.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PlayerManagement;