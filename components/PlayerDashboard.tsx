import React from 'react';
import PuzzleIcon from './icons/PuzzleIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import TrophyIcon from './icons/TrophyIcon';
import { useAppContext } from '../context/AppContext';
// FIX: Import User and Puzzle types for explicit typing.
import { User, Puzzle } from '../lib/types';

const getRankColor = (rank: number) => {
    switch (rank) {
        case 1: return 'text-yellow-400';
        case 2: return 'text-gray-300';
        case 3: return 'text-yellow-600';
        default: return 'text-gray-400';
    }
};

const PlayerDashboard: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { user, players, puzzles } = state;

    const sortedPlayers = [...players].filter(p => p.role !== 'admin').sort((a, b) => b.points - a.points);
    const topPlayers = sortedPlayers.slice(0, 3);
    const userRank = user ? sortedPlayers.findIndex((p: User) => p.id === user.id) + 1 : 0;
    
    const getRequiredLevel = (p: Puzzle) => {
        let req = p.requiredLevel || 1;
        if (p.difficulty === 'Medium') req = Math.max(req, 10);
        if (p.difficulty === 'Hard') req = Math.max(req, 25);
        return req;
    };

    const userLevel = user ? user.level : 1;
    
    // Get a couple of puzzles that are unlocked and unsolved
    const featuredPuzzles = Object.values(puzzles)
        .flat()
        .filter(p => {
            const puzzle = p as Puzzle;
            const req = getRequiredLevel(puzzle);
            const isUnlocked = userLevel >= req;
            const isUnsolved = user ? !user.solvedPuzzleIds.includes(puzzle.id) : true;
            return isUnlocked && isUnsolved;
        })
        .slice(0, 2);

    const setView = (view: 'puzzles' | 'leaderboard' | 'profile') => dispatch({ type: 'SET_VIEW', payload: view });
    const startPuzzle = (puzzle: Puzzle) => {
        if (!user) {
            dispatch({ type: 'SET_VIEW', payload: 'login' });
            return;
        }
        dispatch({ type: 'START_PUZZLE', payload: puzzle });
    };
    
    return (
        <div className="container mx-auto fade-in">
            <div className="text-left mb-12">
                <h1 className="text-4xl font-bold text-gray-100">Welcome, {user?.username || 'Challenger'}!</h1>
                <p className="text-lg text-gray-400 mt-2">Here's a look at the current state of play. Dive in!</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Featured Puzzles */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-neutral-900/50 backdrop-blur-md rounded-2xl p-6 border border-primary">
                        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Featured Puzzles</h2>
                        <div className="space-y-4">
                            {featuredPuzzles.length > 0 ? featuredPuzzles.map((puzzle: Puzzle) => (
                                 <div key={puzzle.id} className="bg-neutral-900/70 p-4 rounded-lg flex justify-between items-center border border-primary hover:border-secondary transition-colors">
                                     <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-gray-100">{puzzle.title}</h3>
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                puzzle.difficulty === 'Medium' ? 'bg-yellow-800 text-yellow-200' : puzzle.difficulty === 'Hard' ? 'bg-red-800 text-red-200' : 'bg-green-800 text-green-200'
                                            }`}>{puzzle.difficulty}</span>
                                        </div>
                                         <div className="flex flex-col">
                                            <p className="text-sm text-gray-400">{puzzle.category}</p>
                                            <div className="flex gap-2">
                                                <span className="text-xs font-bold text-yellow-500">◈ {puzzle.points} Pts</span>
                                                <span className="text-xs font-bold text-blue-400">⚡ {puzzle.xp} XP</span>
                                            </div>
                                         </div>
                                     </div>
                                     <button onClick={() => startPuzzle(puzzle)} className="bg-primary hover:bg-red-900 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm whitespace-nowrap">
                                        Start
                                     </button>
                                 </div>
                            )) : <p className="text-gray-400">No puzzles available.</p>}
                        </div>
                         <button onClick={() => setView('puzzles')} className="w-full mt-6 bg-secondary hover:bg-green-900 text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors">
                            View All Puzzles
                        </button>
                    </div>
                </div>

                {/* Sidebar: Leaderboard and Profile Snippets */}
                <div className="space-y-8">
                    {/* Leaderboard Snippet */}
                    <div className="bg-neutral-900/50 backdrop-blur-md rounded-2xl p-6 border border-primary">
                        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Top Challengers</h2>
                        <ul className="space-y-3">
                            {topPlayers.map((player, index) => (
                                <li key={player.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <TrophyIcon className={`w-6 h-6 ${getRankColor(index + 1)}`} />
                                        <span className="font-medium text-gray-200">{player.username || 'Anonymous Player'}</span>
                                    </div>
                                    <span className="font-bold text-primary">{player.points}</span>
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setView('leaderboard')} className="w-full mt-6 bg-secondary hover:bg-green-900 text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors">
                            View Full Leaderboard
                        </button>
                    </div>
                    {/* Profile Snippet */}
                    {user && (
                        <div className="bg-neutral-900/50 backdrop-blur-md rounded-2xl p-6 border border-primary">
                             <h2 className="text-2xl font-semibold text-gray-100 mb-4">Your Progress</h2>
                             <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <PuzzleIcon className="w-8 h-8 mx-auto text-primary mb-1" />
                                    <p className="text-2xl font-bold text-gray-100">{user.solvedPuzzleIds.length}</p>
                                    <p className="text-xs text-gray-400">Solved</p>
                                </div>
                                 <div>
                                    <TrophyIcon className="w-8 h-8 mx-auto text-yellow-500 mb-1" />
                                    <p className="text-2xl font-bold text-gray-100">{user.points}</p>
                                    <p className="text-xs text-gray-400">Points</p>
                                </div>
                                 <div>
                                    <ChartBarIcon className="w-8 h-8 mx-auto text-secondary mb-1" />
                                    <p className="text-2xl font-bold text-gray-100">#{userRank > 0 ? userRank : 'N/A'}</p>
                                    <p className="text-xs text-gray-400">Rank</p>
                                </div>
                             </div>
                             <button onClick={() => setView('profile')} className="w-full mt-6 bg-secondary hover:bg-green-900 text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors">
                                View Your Profile
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlayerDashboard;