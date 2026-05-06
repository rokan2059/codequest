import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Puzzle } from '../lib/types';
import { useAppContext } from '../context/AppContext';
import PuzzleIcon from './icons/PuzzleIcon';
import LockIcon from './icons/LockIcon';

// Helper for category icons
const CategoryIcon: React.FC<{ category: string; className?: string }> = ({ category, className }) => {
    if (category === 'JavaScript Basics') {
        return (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        );
    }
    if (category === 'Array Methods') {
        return (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        );
    }
    if (category === 'Asynchronous JS') {
        return (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        );
    }
    return <PuzzleIcon className={className} />;
};

const CHAPTER_META: Record<string, { title: string; subtitle: string; description: string }> = {
    'JavaScript Basics': { title: 'JavaScript Basics', subtitle: 'The Foundation', description: 'Master JavaScript Basics concepts.' },
    'Array Methods': { title: 'Array Methods', subtitle: 'The Array Arsenal', description: 'Master Array Methods concepts.' },
    'Asynchronous JS': { title: 'Asynchronous JS', subtitle: 'Async Ascension', description: 'Master Asynchronous JS concepts.' },
    'default': { title: 'Side Quest', subtitle: 'Extra Challenges', description: 'Test your skills with these puzzles.' }
};

const PuzzleList: React.FC = () => {
    const { state, dispatch, selectCategory } = useAppContext();
    const { puzzles, user, selectedCategory } = state;
    
    // -- Detail View State --
    const [filterDifficulty, setFilterDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
    const [searchQuery, setSearchQuery] = useState('');

    // -- Sort & Filter Logic --
    const sortedCategories = useMemo(() => {
        return Object.keys(puzzles).sort((a, b) => {
            // Simple sort, can be enhanced
            return a.localeCompare(b);
        });
    }, [puzzles]);

    // Handle clicking a category card
    const handleCategoryClick = (category: string) => {
        selectCategory(category);
        setFilterDifficulty('All');
        setSearchQuery('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBack = () => {
        selectCategory(null);
    };

    const handleStartPuzzle = (puzzle: Puzzle) => {
        if (!user) {
            dispatch({ type: 'SET_VIEW', payload: 'login' });
            return;
        }
        dispatch({ type: 'START_PUZZLE', payload: puzzle });
    };

    // --- VIEW 1: PUZZLE DETAIL LIST (Selected Category) ---
    if (selectedCategory) {
        const categoryPuzzles = puzzles[selectedCategory] || [];
        const filteredPuzzles = categoryPuzzles.filter(p => {
            // New Gating Logic:
            // Easy puzzles are available at Lvl 1 (or higher if specified).
            // Medium puzzles unlock at Lvl 10 (or higher if specified).
            // Hard puzzles unlock at Lvl 25 (or higher if specified).
            const userLevel = user?.level || 1;
            
            let requiredLevel = p.requiredLevel || 1;
            if (p.difficulty === 'Medium') requiredLevel = Math.max(requiredLevel, 10);
            if (p.difficulty === 'Hard') requiredLevel = Math.max(requiredLevel, 25);
            
            const matchesDifficulty = filterDifficulty === 'All' || p.difficulty === filterDifficulty;
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesDifficulty && matchesSearch;
        });

        return (
            <div className="container mx-auto max-w-6xl py-4 fade-in">
                {/* Back Link */}
                <button 
                    onClick={handleBack} 
                    className="flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors font-medium text-sm"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Categories
                </button>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white mb-8">{selectedCategory}</h1>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg leading-5 bg-gray-800/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                            placeholder="Search puzzles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex bg-gray-800/50 rounded-lg p-1 border border-gray-700">
                        {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                            <button
                                key={diff}
                                onClick={() => setFilterDifficulty(diff as any)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    filterDifficulty === diff
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                                }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Puzzles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPuzzles.length > 0 ? filteredPuzzles.map((puzzle) => (
                        <div key={puzzle.id} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all hover:bg-gray-800/60 flex flex-col h-full group">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                    puzzle.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                                    puzzle.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                    'bg-red-500/20 text-red-300'
                                }`}>
                                    {puzzle.difficulty}
                                </span>
                                {puzzle.requiredLevel && puzzle.requiredLevel > 1 ? (
                                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Lvl {puzzle.requiredLevel}+</span>
                                ) : null}
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-100 mb-2 group-hover:text-blue-400 transition-colors">{puzzle.title}</h3>
                            <p className="text-gray-400 text-sm mb-6 flex-grow">{puzzle.description}</p>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                                <div className="flex items-center text-yellow-400 font-bold text-sm">
                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    {puzzle.points} XP
                                </div>
                                <button 
                                    onClick={() => handleStartPuzzle(puzzle)}
                                    disabled={puzzle.requiredLevel !== undefined && (user?.level || 1) < puzzle.requiredLevel}
                                    className={`text-sm font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-blue-900/20 ${
                                        puzzle.requiredLevel !== undefined && (user?.level || 1) < puzzle.requiredLevel
                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                                    }`}
                                >
                                    {puzzle.requiredLevel !== undefined && (user?.level || 1) < puzzle.requiredLevel ? (
                                        <span className="flex items-center gap-1">
                                            <LockIcon className="w-4 h-4" /> Locked (Lvl {puzzle.requiredLevel})
                                        </span>
                                    ) : 'Start Challenge'}
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-12 text-gray-500 bg-gray-800/20 rounded-xl border border-dashed border-gray-700">
                            No puzzles found matching your criteria.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- VIEW 2: CATEGORY GRID (Skill Areas) ---
    return (
        <div className="container mx-auto max-w-6xl py-8 px-4">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold text-white mb-4">Skill Areas</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Select a topic to test your knowledge. Each category contains puzzles of varying difficulty to help you master the concepts.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCategories.map((category) => {
                    const categoryPuzzles = puzzles[category] || [];
                    const solvedCount = categoryPuzzles.filter(p => user?.solvedPuzzleIds.includes(p.id)).length;
                    const totalCount = categoryPuzzles.length;
                    const meta = CHAPTER_META[category] || CHAPTER_META['default'];
                    const progress = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

                    return (
                        <motion.button
                            key={category}
                            whileHover={{ y: -5 }}
                            onClick={() => handleCategoryClick(category)}
                            className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-8 text-left hover:border-blue-500/50 hover:bg-gray-800/80 transition-all group flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-gray-900 rounded-xl group-hover:bg-blue-900/30 transition-colors">
                                    <CategoryIcon category={category} className="w-8 h-8 text-blue-400 group-hover:text-blue-300" />
                                </div>
                                <span className="bg-gray-700/50 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-600">
                                    {totalCount} Puzzles
                                </span>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{category}</h2>
                            <p className="text-gray-400 text-sm mb-8 flex-grow">{meta.description}</p>

                            <div className="mt-auto">
                                <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
                                    <span>Progress</span>
                                    <span className={progress === 100 ? 'text-green-400' : ''}>{solvedCount} / {totalCount} Solved</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className={`h-1.5 rounded-full transition-all duration-1000 ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default PuzzleList;