
import React, { useState } from 'react';
// FIX: Corrected import paths for icons, assuming Navbar.tsx is in the root directory.
import LogoIcon from './icons/LogoIcon';
import LogoutIcon from './icons/LogoutIcon';
import { View } from '../lib/types';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
    userEmail?: string;
    userName?: string;
    onLogout?: () => void;
    setView: (view: View) => void;
    selectCategory: (category: string | null) => void;
    activeView: View;
}

const NavLink: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:bg-secondary hover:text-white'
        }`}
    >
        {label}
    </button>
);

const Navbar: React.FC<NavbarProps> = ({ userEmail, userName, onLogout, setView, selectCategory, activeView }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const displayName = userName || (userEmail ? 'Challenger' : undefined);
    const handlePuzzlesClick = () => {
        selectCategory(null); // Reset category selection to show the main hub
        setView('puzzles');
        setIsMobileMenuOpen(false);
    };

    const handleViewChange = (v: View) => {
        setView(v);
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-primary">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <LogoIcon />
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <NavLink label="Dashboard" isActive={activeView === 'player_dashboard'} onClick={() => handleViewChange('player_dashboard')} />
                                <NavLink label="Puzzles" isActive={activeView === 'puzzles' || activeView === 'puzzle_view'} onClick={handlePuzzlesClick} />
                                <NavLink label="Leaderboard" isActive={activeView === 'leaderboard'} onClick={() => handleViewChange('leaderboard')} />
                                {userEmail && <NavLink label="Profile" isActive={activeView === 'profile'} onClick={() => handleViewChange('profile')} />}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center">
                         {displayName ? (
                             <>
                                 <span className="text-gray-400 text-sm mr-4">{displayName}</span>
                                 <button
                                     onClick={onLogout}
                                     title="Log Out"
                                     className="p-2 rounded-full text-gray-400 bg-background hover:text-white hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary h-[44px] w-[44px] flex items-center justify-center"
                                 >
                                     <LogoutIcon className="h-6 w-6" />
                                 </button>
                             </>
                         ) : (
                             <button
                                 onClick={() => handleViewChange('login')}
                                 className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-red-900 border min-h-[44px]"
                             >
                                 Login
                             </button>
                         )}
                    </div>
                    {/* Mobile menu button */}
                    <div className="flex md:hidden items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="bg-transparent text-gray-400 hover:text-white focus:outline-none h-[44px] w-[44px] flex justify-center items-center"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu, show/hide based on menu state. */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-background border-b border-primary">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
                        <NavLink label="Dashboard" isActive={activeView === 'player_dashboard'} onClick={() => handleViewChange('player_dashboard')} />
                        <NavLink label="Puzzles" isActive={activeView === 'puzzles' || activeView === 'puzzle_view'} onClick={handlePuzzlesClick} />
                        <NavLink label="Leaderboard" isActive={activeView === 'leaderboard'} onClick={() => handleViewChange('leaderboard')} />
                        {userEmail && <NavLink label="Profile" isActive={activeView === 'profile'} onClick={() => handleViewChange('profile')} />}
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-700">
                        {displayName ? (
                            <div className="flex items-center px-5 flex-col gap-4">
                                <div className="text-base font-medium text-white">{displayName}</div>
                                <button
                                    onClick={() => {
                                        if (onLogout) onLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-3 rounded-md text-sm font-medium text-white bg-primary hover:bg-red-900 min-h-[44px]"
                                >
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            <div className="px-5">
                                <button
                                    onClick={() => handleViewChange('login')}
                                    className="w-full px-4 py-3 rounded-md text-sm font-medium text-white bg-primary hover:bg-red-900 min-h-[44px]"
                                >
                                    Login
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
