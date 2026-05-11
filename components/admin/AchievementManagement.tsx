import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Achievement } from '../../lib/types';
import { uploadFile } from '../../lib/storageService';

const AchievementManagement: React.FC = () => {
    const { state, dispatch, addAchievement, editAchievement, deleteAchievement, addToast } = useAppContext();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('🏆');
    const [imageUrl, setImageUrl] = useState('');
    const [requiredPuzzles, setRequiredPuzzles] = useState(0);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const bucket = 'achievements'; // Assuming this bucket exists or will be created
            const path = `achievement_${Date.now()}_${file.name}`;
            const url = await uploadFile(bucket, path, file);
            setImageUrl(url);
            addToast('Image uploaded successfully');
        } catch (error: any) {
            console.error('Upload failed:', error);
            addToast('Upload failed: ' + (error.message || 'Unknown error'), 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description) return;
        
        if (editingId) {
            const updatedAchievement: Achievement = {
                id: editingId,
                name,
                description,
                icon,
                imageUrl,
                requiredPuzzles: Number(requiredPuzzles)
            };
            await editAchievement(updatedAchievement);
            setEditingId(null);
        } else {
            const newAchievement: Achievement = {
                id: 'ach_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                name,
                description,
                icon,
                imageUrl,
                requiredPuzzles: Number(requiredPuzzles)
            };
            await addAchievement(newAchievement);
        }
        
        resetForm();
    };

    const handleEdit = (a: Achievement) => {
        setEditingId(a.id);
        setName(a.name);
        setDescription(a.description);
        setIcon(a.icon);
        setImageUrl(a.imageUrl || '');
        setRequiredPuzzles(a.requiredPuzzles);
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setDescription('');
        setIcon('🏆');
        setImageUrl('');
        setRequiredPuzzles(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="p-6 bg-slate-800 rounded-xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                    {editingId ? 'Edit Achievement' : 'Achievement Maker'}
                </h2>
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
            <form onSubmit={handleSave} className="space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                    <input type="text" placeholder="Icon (emoji or lucide icon name)" value={icon} onChange={e => setIcon(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                </div>
                <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                
                <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1 w-full">
                        <label className="block text-slate-400 mb-1 text-sm">Image URL (or upload below)</label>
                        <input type="text" placeholder="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                    </div>
                    <div className="flex-shrink-0 pt-6">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="image/*"
                        />
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className={`px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded border border-slate-600 transition-colors flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isUploading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                    Upload Local File
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="number" placeholder="Required Puzzles" value={requiredPuzzles} onChange={e => setRequiredPuzzles(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-sky-600 font-bold hover:bg-sky-700 text-white py-2 px-6 rounded-lg transition-colors">
                            {editingId ? 'Update Achievement' : 'Create Achievement'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </form>
            
            <div className="grid gap-4">
                {state.achievements.map(a => (
                    <div key={a.id} className="flex justify-between items-center bg-slate-900 p-4 rounded-lg border border-slate-700 text-white">
                        <div className="flex items-center">
                            {a.imageUrl ? (
                                <img src={a.imageUrl} alt={a.name} className="w-10 h-10 object-cover rounded-full mr-3 border border-slate-600" />
                            ) : (
                                <span className="text-2xl mr-3">{a.icon}</span>
                            )}
                            <div>
                                <div className="font-bold text-slate-100">{a.name}</div>
                                <div className="text-sm text-slate-400">{a.description} <span className="text-sky-400 font-mono ml-2">({a.requiredPuzzles} puzzles)</span></div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => handleEdit(a)} className="text-sky-400 hover:text-sky-300 font-medium px-3 py-1 rounded hover:bg-sky-400/10 transition-all">Edit</button>
                            <button onClick={() => deleteAchievement(a.id)} className="text-red-400 hover:text-red-300 font-medium px-3 py-1 rounded hover:bg-red-400/10 transition-all">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AchievementManagement;
