import React from 'react';
import { useAppContext } from '../../context/AppContext';
import TrophyIcon from '../icons/TrophyIcon';

const getRankColor = (rank: number) => {
    switch (rank) {
        case 1: return 'text-yellow-400';
        case 2: return 'text-gray-300';
        case 3: return 'text-yellow-600';
        default: return 'text-gray-400';
    }
};

const AdminLeaderboard: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { players } = state;

    const sortedPlayers = [...players]
        .filter(p => p.role !== 'admin')
        .sort((a, b) => b.points - a.points);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-slate-900 text-white fade-in">
             <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800 p-4 sm:p-6 lg:p-8 flex items-center mb-8 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                 <button onClick={() => dispatch({ type: 'SET_ADMIN_VIEW', payload: 'main' })} className="mr-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors font-medium border border-slate-700 flex items-center gap-2">
                    &larr; Back
                </button>
                <h1 className="text-3xl font-bold text-gray-100">Global Leaderboard</h1>
            </header>

            <div className="px-4 sm:px-6 lg:px-8 pb-8">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-800 text-slate-400 text-sm uppercase">
                        <tr>
                            <th className="p-4">Rank</th>
                            <th className="p-4">Player</th>
                            <th className="p-4 text-center">Level</th>
                            <th className="p-4 text-right">Points</th>
                            <th className="p-4 text-center">Puzzles Solved</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {sortedPlayers.length > 0 ? (
                            sortedPlayers.map((player, index) => {
                                const rank = index + 1;
                                return (
                                    <tr key={player.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold text-lg w-6 text-center ${getRankColor(rank)}`}>{rank}</span>
                                                {rank <= 3 && <TrophyIcon className={`w-5 h-5 ${getRankColor(rank)}`} />}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-slate-200">
                                            {player.username || 'Anonymous Player'}
                                        </td>
                                         <td className="p-4 text-center text-slate-400">
                                            {player.level}
                                        </td>
                                        <td className="p-4 text-right font-mono text-blue-400 font-bold">
                                            {(player.points || 0).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center text-slate-400">
                                            {player.solvedPuzzleIds.length}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                    No players found.
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

export default AdminLeaderboard;