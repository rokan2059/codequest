import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const SettingsManagement: React.FC = () => {
    const { state, updateCertificateRequirements, dispatch } = useAppContext();
    const { certificateRequirements } = state;

    const [levelReq, setLevelReq] = useState(certificateRequirements.level.toString());
    const [puzzlesReq, setPuzzlesReq] = useState(certificateRequirements.puzzles.toString());

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        const level = parseInt(levelReq);
        const puzzles = parseInt(puzzlesReq);

        if (isNaN(level) || isNaN(puzzles) || level < 1 || puzzles < 1) {
            alert('Please enter valid numbers greater than 0.');
            return;
        }

        updateCertificateRequirements({ level, puzzles });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-slate-900 text-white fade-in">
            <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800 p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 mb-2">Platform Settings</h1>
                    <p className="text-slate-400">Configure global application settings and requirements.</p>
                </div>
                <button 
                    onClick={() => dispatch({ type: 'SET_ADMIN_VIEW', payload: 'main' })}
                    className="flex flex-wrap items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors border border-slate-600 self-start md:self-auto"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Dashboard
                </button>
            </header>

            <div className="p-4 sm:p-6 lg:p-8 pt-0">
                <div className="max-w-2xl bg-slate-800/80 p-8 rounded-xl border border-slate-700 shadow-xl">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                    <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    Certificate Requirements
                </h2>
                
                <p className="text-slate-400 mb-6">
                    Set the minimum level and number of solved puzzles required for a player to unlock and download their official certificate.
                </p>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Required Level
                        </label>
                        <input 
                            type="number" 
                            min="1"
                            value={levelReq}
                            onChange={(e) => setLevelReq(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Required Solved Puzzles
                        </label>
                        <input 
                            type="number" 
                            min="1"
                            value={puzzlesReq}
                            onChange={(e) => setPuzzlesReq(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            required
                        />
                    </div>
                    
                    <div className="pt-4 border-t border-slate-700">
                        <button 
                            type="submit"
                            className="w-full px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Save Requirements
                        </button>
                    </div>
                </form>
            </div>
            </div>
        </div>
    );
};

export default SettingsManagement;
