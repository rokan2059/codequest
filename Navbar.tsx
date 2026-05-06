import React from 'react';
// FIX: Corrected import paths for icons, assuming Navbar.tsx is in the root directory.
import LogoIcon from './components/icons/LogoIcon';
import LogoutIcon from './components/icons/LogoutIcon';

type View = 'player_dashboard' | 'puzzles' | 'leaderboard' | 'profile' | 'puzzle_view';

interface NavbarProps {
    userEmail: string;
    onLogout: () => void;
    setView: (view: View) => void;
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
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
    >
        {label}
    </button>
);

const Navbar: React.FC<NavbarProps> = ({ userEmail, onLogout, setView, activeView }) => {
    return (
        <nav className="sticky top-0 z-50 bg-gray-800/50 backdrop-blur-lg border-b border-gray-700">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <LogoIcon />
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <NavLink label="Dashboard" isActive={activeView === 'player_dashboard'} onClick={() => setView('player_dashboard')} />
                                <NavLink label="Puzzles" isActive={activeView === 'puzzles' || activeView === 'puzzle_view'} onClick={() => setView('puzzles')} />
                                <NavLink label="Leaderboard" isActive={activeView === 'leaderboard'} onClick={() => setView('leaderboard')} />
                                <NavLink label="Profile" isActive={activeView === 'profile'} onClick={() => setView('profile')} />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                         <span className="text-gray-400 text-sm mr-4 hidden sm:block">{userEmail}</span>
                        <button
                            onClick={onLogout}
                            title="Log Out"
                            className="p-2 rounded-full text-gray-400 bg-gray-800 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
                        >
                            <LogoutIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;