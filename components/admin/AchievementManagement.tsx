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
            id: 'ach_' + Date.now(),
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
            <h2 className="text-2xl font-bold text-white mb-6">Achievement Maker</h2>
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
