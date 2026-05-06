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
        .filter(p => p.role === 'player')
        .sort((a, b) => b.points - a.points);

    return (
        <div className="container mx-auto max-w-4xl fade-in">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-100">Leaderboard</h1>
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700 shadow-2xl">
                <ul className="divide-y divide-gray-700">
                    {sortedPlayers.map((player, index) => {
                        const rank = index + 1;
                        const isCurrentUser = player.id === user?.id;

                        return (
                            <li key={player.id} className={`flex items-center p-4 ${isCurrentUser ? 'bg-blue-900/50' : ''} ${index === 0 ? 'rounded-t-xl' : ''} ${index === sortedPlayers.length - 1 ? 'rounded-b-xl' : ''}`}>
                                <div className="flex items-center w-1/6">
                                    <span className={`text-2xl font-bold w-8 text-center ${getRankColor(rank)}`}>
                                        {rank}
                                    </span>
                                    {rank <= 3 && <TrophyIcon className={`w-6 h-6 ml-2 ${getRankColor(rank)}`} />}
                                </div>
                                <div className="w-4/6">
                                    <p className="text-lg font-medium text-gray-100 truncate">
                                        {player.email}
                                        {isCurrentUser && <span className="text-xs text-blue-400 ml-2">(You)</span>}
                                    </p>
                                </div>
                                <div className="w-1/6 text-right">
                                    <p className="text-xl font-semibold text-blue-400">{player.points.toLocaleString()}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default Leaderboard;
