import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Achievement } from '../../lib/types';

const AchievementManagement: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('🏆');
    const [imageUrl, setImageUrl] = useState('');
    const [requiredPuzzles, setRequiredPuzzles] = useState(0);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description) return;
        
        const newAchievement: Achievement = {
            id: 'ach_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            name,
            description,
            icon,
            imageUrl,
            requiredPuzzles: Number(requiredPuzzles)
        };
        
        dispatch({ type: 'ADD_ACHIEVEMENT', payload: newAchievement });
        setName('');
        setDescription('');
        setImageUrl('');
        setRequiredPuzzles(0);
    };

    return (
        <div className="p-6 bg-slate-800 rounded-xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Achievement Maker</h2>
                <button 
                    onClick={() => dispatch({ type: 'SET_ADMIN_VIEW', payload: 'main' })}
                    className="flex items-center gap-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors text-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Dashboard
                </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4 mb-8">
                <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                <input type="text" placeholder="Icon (emoji)" value={icon} onChange={e => setIcon(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                <input type="text" placeholder="Image URL (optional)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                <input type="number" placeholder="Required Puzzles" value={requiredPuzzles} onChange={e => setRequiredPuzzles(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                <button type="submit" className="bg-sky-600 text-white py-2 px-4 rounded">Create Achievement</button>
            </form>
            
            <div className="grid gap-4">
                {state.achievements.map(a => (
                    <div key={a.id} className="flex justify-between items-center bg-slate-900 p-4 rounded text-white">
                        <div className="flex items-center">
                            {a.imageUrl ? (
                                <img src={a.imageUrl} alt={a.name} className="w-10 h-10 object-cover rounded-full mr-2" />
                            ) : (
                                <span className="text-2xl mr-2">{a.icon}</span>
                            )}
                            <div>
                                <span className="font-bold">{a.name}</span>: {a.description} ({a.requiredPuzzles} puzzles)
                            </div>
                        </div>
                        <button onClick={() => dispatch({ type: 'DELETE_ACHIEVEMENT', payload: a.id })} className="text-red-400">Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AchievementManagement;
