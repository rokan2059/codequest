import React from 'react';
import TrophyIcon from './icons/TrophyIcon';
import { useAppContext } from '../context/AppContext';

const getRankColor = (rank: number) => {
    switch (rank) {
        case 1: return 'text-yellow-400';
        case 2: return 'text-gray-300';
        case 3: return 'text-yellow-600';
        default: return 'text-gray-400';
    }
};

const Leaderboard: React.FC = () => {
    const { state } = useAppContext();
    const { players, user } = state;

    const sortedPlayers = [...players]
        .filter(p => p.role !== 'admin')
        .sort((a, b) => (b.points || 0) - (a.points || 0));

    return (
        <div className="container mx-auto max-w-4xl fade-in">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-100">Leaderboard</h1>
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700 shadow-2xl">
                {sortedPlayers.length > 0 ? (
                    <ul className="divide-y divide-gray-700">
                        {sortedPlayers.map((player, index) => {
                            const rank = index + 1;
                            const isCurrentUser = player.id === user?.id;

                            return (
                                <li key={player.id} className={`flex items-center justify-between p-4 ${isCurrentUser ? 'bg-blue-900/50' : ''} ${index === 0 ? 'rounded-t-xl' : ''} ${index === sortedPlayers.length - 1 ? 'rounded-b-xl' : ''}`}>
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="flex items-center justify-center shrink-0 w-12">
                                            <span className={`text-xl sm:text-2xl font-bold ${getRankColor(rank)}`}>
                                                {rank}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base sm:text-lg font-medium text-gray-100 truncate flex items-center gap-2">
                                                {player.email}
                                                {rank <= 3 && <TrophyIcon className={`w-5 h-5 hidden sm:block ${getRankColor(rank)}`} />}
                                                {isCurrentUser && <span className="text-xs text-blue-400 shrink-0">(You)</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <p className="text-lg sm:text-xl font-semibold text-blue-400">{(player.points || 0).toLocaleString()}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        No players on the leaderboard yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
