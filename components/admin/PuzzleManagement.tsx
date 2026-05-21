import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Puzzle } from '../../lib/types';

const BLANK_FORM_STATE = {
    title: '',
    category: '',
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
    points: '10',
    description: '',
    code: '',
    answer: '',
    xp: '0',
    requiredLevel: ''
};

const PuzzleManagement: React.FC = () => {
    const { state, dispatch, addToast, addPuzzle, editPuzzle, deletePuzzle } = useAppContext();
    const { puzzles } = state;
    const puzzleCategories = Object.keys(puzzles);
    
    const [formState, setFormState] = useState(BLANK_FORM_STATE);
    const [editingPuzzle, setEditingPuzzle] = useState<Puzzle | null>(null);

    useEffect(() => {
        if (editingPuzzle) {
            setFormState({
                ...editingPuzzle,
                points: String(editingPuzzle.points),
                xp: String(editingPuzzle.xp || 0),
                requiredLevel: String(editingPuzzle.requiredLevel || 1)
            });
        } else {
            setFormState({
                ...BLANK_FORM_STATE,
                category: puzzleCategories[0] || ''
            });
        }
    }, [editingPuzzle, puzzles]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCancelEdit = () => {
        setEditingPuzzle(null);
    }
    
    const handleEditClick = (puzzle: Puzzle) => {
        setEditingPuzzle(puzzle);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleDeleteClick = async (puzzle: Puzzle) => {
        if (window.confirm(`Are you sure you want to delete the puzzle "${puzzle.title}"? This cannot be undone.`)) {
            try {
                await deletePuzzle(puzzle.id);
                if(editingPuzzle?.id === puzzle.id) {
                    handleCancelEdit();
                }
            } catch (e) {
                // error is already handled by context
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const puzzleData = {
            ...formState,
            points: parseInt(formState.points, 10) || 0,
            xp: parseInt(formState.xp, 10) || 0,
            requiredLevel: parseInt(formState.requiredLevel, 10) || 1
        };

        if (!puzzleData.title || !puzzleData.code || !puzzleData.answer || !puzzleData.category) {
            addToast('Title, Category, Code, and Answer are required.', 'error');
            return;
        }

        try {
            if (editingPuzzle) {
                await editPuzzle({ ...puzzleData, id: editingPuzzle.id });
                setEditingPuzzle(null);
            } else {
                await addPuzzle({ ...puzzleData, id: `puzzle_${Date.now()}_${Math.floor(Math.random() * 1000)}` });
                setFormState({
                    ...BLANK_FORM_STATE,
                    category: puzzleCategories.includes(puzzleData.category) ? puzzleData.category : (puzzleCategories[0] || '')
                });
            }
        } catch(e) {}
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-slate-900 text-white fade-in">
            <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800 p-4 sm:p-6 lg:p-8 flex items-center mb-8 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                 <button onClick={() => dispatch({ type: 'SET_ADMIN_VIEW', payload: 'main'})} className="mr-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors font-medium border border-slate-700 flex items-center gap-2">
                    &larr; Back
                </button>
                <h1 className="text-3xl font-bold text-gray-100">Puzzle Management</h1>
            </header>

            <div className="px-4 sm:px-6 lg:px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Add/Edit Puzzle Form */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700 self-start">
                    <h2 className="text-2xl font-semibold mb-4">{editingPuzzle ? 'Edit Puzzle' : 'Add New Puzzle'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Puzzle Title</label>
                            <input name="title" value={formState.title} onChange={handleInputChange} placeholder="Puzzle Title" className="w-full p-2 bg-gray-900 border border-gray-700 rounded focus:border-blue-500 focus:outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Puzzle Category</label>
                            <select name="category" value={formState.category} onChange={handleInputChange} className="w-full p-2 bg-gray-900 border border-gray-700 rounded" required>
                                {puzzleCategories.length === 0 ? (
                                    <option disabled value="">Create a category first</option>
                                ) : (
                                    puzzleCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                            <textarea name="description" value={formState.description} onChange={handleInputChange} placeholder="Description" className="w-full p-2 bg-gray-900 border border-gray-700 rounded focus:border-blue-500 focus:outline-none" rows={2}></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Code Snippet</label>
                            <textarea name="code" value={formState.code} onChange={handleInputChange} placeholder="Code Snippet" className="w-full p-2 bg-gray-900 border border-gray-700 rounded font-mono focus:border-blue-500 focus:outline-none" rows={5} required></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Correct Answer</label>
                            <textarea name="answer" value={formState.answer} onChange={handleInputChange} placeholder="Correct Answer" className="w-full p-2 bg-gray-900 border border-gray-700 rounded font-mono focus:border-blue-500 focus:outline-none" rows={2} required></textarea>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1 font-semibold text-gray-300">Difficulty</label>
                                <select name="difficulty" value={formState.difficulty} onChange={handleInputChange} className="w-full p-2 bg-gray-900 border border-gray-700 rounded focus:border-blue-500 focus:outline-none">
                                    <option>Easy</option>
                                    <option>Medium</option>
                                    <option>Hard</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1 font-semibold text-gray-300">Required Level</label>
                                <input type="number" name="requiredLevel" value={formState.requiredLevel} onChange={handleInputChange} placeholder="Required level to unlock" className="w-full p-2 bg-gray-900 border border-gray-700 rounded focus:border-blue-500 focus:outline-none" required/>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Points</label>
                                <input type="number" name="points" value={formState.points} onChange={handleInputChange} placeholder="10" className="w-full p-2 bg-gray-900 border border-gray-700 rounded focus:border-blue-500 focus:outline-none" required/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">XP</label>
                                <input type="number" name="xp" value={formState.xp} onChange={handleInputChange} placeholder="150" className="w-full p-2 bg-gray-900 border border-gray-700 rounded focus:border-blue-500 focus:outline-none" required/>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button type="submit" className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                {editingPuzzle ? 'Update Puzzle' : 'Add Puzzle'}
                             </button>
                             {editingPuzzle && (
                                <button type="button" onClick={handleCancelEdit} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                    Cancel
                                </button>
                             )}
                        </div>
                    </form>
                </div>
                
                {/* Existing Puzzles List */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700 max-h-[80vh] overflow-y-auto">
                    <h2 className="text-2xl font-semibold mb-4">Existing Puzzles</h2>
                    <div className="space-y-6">
                        {Object.entries(puzzles).map(([category, puzzleItems]) => (
                            <div key={category}>
                                <h3 className="text-xl font-bold text-blue-400 mb-2">{category}</h3>
                                <ul className="space-y-2">
                                    {(puzzleItems as Puzzle[]).map((puzzle: Puzzle) => (
                                        <li key={puzzle.id} className="text-sm p-3 bg-gray-900/50 rounded border border-gray-700 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-gray-100">{puzzle.title}</p>
                                                <p className="text-gray-400">{puzzle.difficulty}, {puzzle.points} pts, {puzzle.xp} XP, Lvl Req: {puzzle.requiredLevel || 1}</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={() => handleEditClick(puzzle)} className="text-blue-400 hover:text-blue-300 font-medium">Edit</button>
                                                <button onClick={() => handleDeleteClick(puzzle)} className="text-red-400 hover:text-red-300 font-medium">Delete</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default PuzzleManagement;