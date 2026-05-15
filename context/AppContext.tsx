import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Puzzle, Achievement, View } from '../lib/types';
import * as Auth from '../lib/auth';
import { supabase } from '../lib/supabase';
import * as PuzzleService from '../lib/puzzleService';
import * as AchievementService from '../lib/achievementService';
import * as SettingsService from '../lib/settingsService';
import { achievements as achievementData } from '../data/achievements';

type AdminView = 'main' | 'puzzle_management' | 'category_management' | 'player_management' | 'achievement_management' | 'settings_management' | 'leaderboard';
type ToastMessage = { id: number; message: string; type: 'success' | 'error' };

export interface CertificateRequirements {
    level: number;
    puzzles: number;
}

interface AppState {
    user: User | null;
    view: View;
    adminView: AdminView;
    selectedCategory: string | null;
    currentPuzzle: Puzzle | null;
    puzzles: Record<string, Puzzle[]>;
    achievements: Achievement[];
    players: User[];
    toasts: ToastMessage[];
    certificateRequirements: CertificateRequirements;
    isInitialized: boolean;
}

type Action =
    | { type: 'INITIALIZE_DATA'; payload: { puzzles: Record<string, Puzzle[]>, players: User[], achievements: Achievement[] } }
    | { type: 'LOGIN_SUCCESS'; payload: User }
    | { type: 'LOGOUT' }
    | { type: 'SET_VIEW'; payload: View }
    | { type: 'SET_ADMIN_VIEW', payload: AdminView }
    | { type: 'SELECT_CATEGORY'; payload: string | null }
    | { type: 'START_PUZZLE'; payload: Puzzle }
    | { type: 'COMPLETE_PUZZLE'; payload: { puzzleId: string; points: number; xp: number } }
    | { type: 'ADD_PUZZLE'; payload: Puzzle }
    | { type: 'EDIT_PUZZLE'; payload: Puzzle }
    | { type: 'DELETE_PUZZLE'; payload: string }
    | { type: 'ADD_CATEGORY', payload: string }
    | { type: 'EDIT_CATEGORY', payload: { oldName: string; newName: string } }
    | { type: 'DELETE_CATEGORY', payload: string }
    | { type: 'DELETE_PLAYER', payload: string }
    | { type: 'RESET_PLAYER_PROGRESS', payload: string }
    | { type: 'ADD_TOAST'; payload: { message: string; type: 'success' | 'error' } }
    | { type: 'REMOVE_TOAST'; payload: number }
    | { type: 'ADD_ACHIEVEMENT'; payload: Achievement }
    | { type: 'DELETE_ACHIEVEMENT'; payload: string }
    | { type: 'SET_CERTIFICATE_REQUIREMENTS'; payload: CertificateRequirements };

const initialState: AppState = {
    user: null,
    view: 'player_dashboard',
    adminView: 'main',
    selectedCategory: null,
    currentPuzzle: null,
    puzzles: {},
    achievements: achievementData,
    players: [],
    toasts: [],
    certificateRequirements: { level: 10, puzzles: 10 },
    isInitialized: false
};

const AppContext = createContext<{
    state: AppState;
    dispatch: React.Dispatch<Action>;
    login: typeof Auth.login;
    signup: (email: string, password: string, username: string) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
    selectCategory: (category: string | null) => void;
    addToast: (message: string, type?: 'success' | 'error') => void;
    addPuzzle: (puzzle: Puzzle) => void;
    editPuzzle: (puzzle: Puzzle) => Promise<void>;
    deletePuzzle: (puzzleId: string) => Promise<void>;
    addCategory: (name: string) => Promise<void>;
    editCategory: (oldName: string, newName: string) => Promise<void>;
    deleteCategory: (name: string) => Promise<void>;
    deletePlayer: (id: string) => void;
    resetPlayerProgress: (id: string) => void;
    completePuzzle: (puzzleId: string, points: number, xpValue: number) => void;
    addAchievement: (achievement: Achievement) => void;
    editAchievement: (achievement: Achievement) => Promise<void>;
    deleteAchievement: (id: string) => void;
    deductPoints: (points: number, reason?: string) => Promise<boolean>;
    updateCertificateRequirements: (req: CertificateRequirements) => void;
}>({
    state: initialState,
    dispatch: () => null,
    login: Auth.login,
    signup: Auth.signup,
    logout: () => {},
    selectCategory: () => {},
    addToast: () => {},
    addPuzzle: () => {},
    editPuzzle: async () => {},
    deletePuzzle: async () => {},
    addCategory: async () => {},
    editCategory: async () => {},
    deleteCategory: async () => {},
    deletePlayer: () => {},
    resetPlayerProgress: () => {},
    completePuzzle: () => {},
    addAchievement: () => {},
    editAchievement: async () => {},
    deleteAchievement: () => {},
    deductPoints: async () => false,
    updateCertificateRequirements: () => {},
});

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'INITIALIZE_DATA': {
            const settingsAchievement = action.payload.achievements.find(a => a.id === '__APPLET_SETTINGS__');
            let updatedCertReq = state.certificateRequirements;
            if (settingsAchievement && settingsAchievement.description) {
                try {
                    const parsed = JSON.parse(settingsAchievement.description);
                    if (parsed.applet_certificate_req) {
                        updatedCertReq = parsed.applet_certificate_req;
                    }
                } catch (e) {
                    console.error('Failed to parse cert req from achievement', e);
                }
            }
            
            const filteredAchievements = action.payload.achievements.filter(a => a.id !== '__APPLET_SETTINGS__');
            return {
                ...state,
                puzzles: action.payload.puzzles,
                players: action.payload.players,
                achievements: filteredAchievements,
                certificateRequirements: updatedCertReq,
                isInitialized: true
            };
        }
        case 'LOGIN_SUCCESS':
            // Only change view if current view is login or undefined to prevent redirect from active screens
            const shouldChangeView = state.view === 'login' || (state.user === null && state.view === 'player_dashboard');
            const updatedUser = action.payload;
            
            // Re-sync the player in the players list if it exists
            const playerExists = state.players.some(p => p.id === updatedUser.id);
            const updatedPlayers = playerExists
                ? state.players.map(p => p.id === updatedUser.id ? updatedUser : p)
                : [...state.players, updatedUser];

            return {
                ...state,
                user: updatedUser,
                players: updatedPlayers,
                view: shouldChangeView 
                    ? (updatedUser.role === 'admin' ? 'admin_dashboard' : 'player_dashboard') 
                    : state.view,
                adminView: 'main',
            };
        case 'LOGOUT':
            return {
                ...initialState,
                user: null,
                view: 'login',
            };
        case 'SET_VIEW':
            return {
                ...state,
                view: action.payload,
            };
        case 'SET_ADMIN_VIEW':
             if (state.user?.role !== 'admin') return state;
            return {
                ...state,
                adminView: action.payload,
            };
        case 'SELECT_CATEGORY':
            return {
                ...state,
                selectedCategory: action.payload,
            };
        case 'START_PUZZLE':
            return {
                ...state,
                currentPuzzle: action.payload,
                view: 'puzzle_view',
            };
        case 'ADD_PUZZLE':
        case 'EDIT_PUZZLE':
        case 'DELETE_PUZZLE':
        case 'ADD_CATEGORY':
        case 'EDIT_CATEGORY':
        case 'DELETE_CATEGORY':
        case 'ADD_ACHIEVEMENT':
        case 'DELETE_ACHIEVEMENT':
            // These are now handled by async methods in AppProvider
            return state;
        case 'DELETE_PLAYER':
            return {
                ...state,
                players: state.players.filter(p => p.id !== action.payload)
            };
        case 'RESET_PLAYER_PROGRESS':
            return {
                ...state,
                players: state.players.map(p => p.id === action.payload ? { 
                    ...p, 
                    points: 0, 
                    xp: 0, 
                    level: 1, 
                    xpToNextLevel: 150, 
                    solvedPuzzleIds: [], 
                    achievements: [],
                    certificate_id: undefined,
                    certificate_name: undefined,
                    certificate_issued_at: undefined
                } : p)
            };
        case 'ADD_TOAST':
            return {
                ...state,
                toasts: [...state.toasts, { ...action.payload, id: Math.random() * 999999 + Date.now() }],
            };
        case 'REMOVE_TOAST':
            return {
                ...state,
                toasts: state.toasts.filter(toast => toast.id !== action.payload),
            };
        case 'SET_CERTIFICATE_REQUIREMENTS':
            return {
                ...state,
                certificateRequirements: action.payload
            };
        default:
            return state;
    }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    useEffect(() => {
        const initData = async () => {
            try {
                console.log('Initializing data...');
                
                // Load settings safely
                try {
                    const dbSettings = await SettingsService.loadSettings();
                    if (dbSettings) {
                        dispatch({ type: 'SET_CERTIFICATE_REQUIREMENTS', payload: dbSettings });
                    }
                } catch (e) {
                    console.error('Failed to load settings from DB:', e);
                }

                // Load main data with individual error handling
                const [puzzles, players, achievements] = await Promise.all([
                    PuzzleService.getPuzzles().catch(e => { console.error('Puzzles load failed:', e); return {}; }),
                    Auth.getPlayers().catch(e => { console.error('Players load failed:', e); return []; }),
                    AchievementService.getAchievements().catch(e => { console.error('Achievements load failed:', e); return []; })
                ]);

                dispatch({ type: 'INITIALIZE_DATA', payload: { puzzles, players: players as User[], achievements: achievements as Achievement[] } });

                const loggedInUser = await Auth.getLoggedInUser();
                if (loggedInUser) {
                    dispatch({ type: 'LOGIN_SUCCESS', payload: loggedInUser });
                }
                console.log('Data initialization attempt finished');
            } catch (error) {
                console.error('Critical failure in initialize data:', error);
            }
        };

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event);
            if (event === 'PASSWORD_RECOVERY') {
                dispatch({ type: 'SET_VIEW', payload: 'reset_password' });
            }
            if (event === 'SIGNED_IN' && session?.user) {
                initData();
            }
            if (event === 'SIGNED_OUT') {
                dispatch({ type: 'LOGOUT' });
            }
        });

        initData();

        return () => {
            if (authListener?.subscription) {
                authListener.subscription.unsubscribe();
            }
        };
    }, []);

    const logout = async () => {
        await Auth.logout();
        dispatch({ type: 'LOGOUT' });
        addToast('You have been logged out.');
    };
    
    const addToast = (message: string, type: 'success' | 'error' = 'success') => {
        dispatch({ type: 'ADD_TOAST', payload: { message, type } });
    };

    const selectCategory = (category: string | null) => {
        dispatch({ type: 'SELECT_CATEGORY', payload: category });
    };

    const addPuzzle = async (puzzle: Puzzle) => {
        try {
            await PuzzleService.addPuzzle(puzzle);
            const puzzles = await PuzzleService.getPuzzles();
            dispatch({ type: 'INITIALIZE_DATA', payload: { ...state, puzzles, players: state.players, achievements: state.achievements } });
            addToast('Puzzle added successfully');
        } catch (error: any) {
            addToast(error.message || 'Error adding puzzle', 'error');
        }
    };

    const editPuzzle = async (puzzle: Puzzle) => {
        try {
            await PuzzleService.editPuzzle(puzzle);
            const puzzles = await PuzzleService.getPuzzles();
            dispatch({ type: 'INITIALIZE_DATA', payload: { ...state, puzzles, players: state.players, achievements: state.achievements } });
            addToast('Puzzle updated successfully');
        } catch (error: any) {
            addToast(error.message || 'Error updating puzzle', 'error');
        }
    };

    const deletePuzzle = async (puzzleId: string) => {
        try {
            await PuzzleService.deletePuzzle(puzzleId);
            const puzzles = await PuzzleService.getPuzzles();
            dispatch({ type: 'INITIALIZE_DATA', payload: { ...state, puzzles, players: state.players, achievements: state.achievements } });
            addToast('Puzzle deleted successfully');
        } catch (error: any) {
            addToast(error.message || 'Error deleting puzzle', 'error');
        }
    };

    const addCategory = async (name: string) => {
        try {
            await PuzzleService.addCategory(name);
            const puzzles = await PuzzleService.getPuzzles();
            dispatch({ type: 'INITIALIZE_DATA', payload: { ...state, puzzles, players: state.players, achievements: state.achievements } });
            addToast('Category added successfully');
        } catch (error: any) {
            addToast(error.message || 'Error adding category', 'error');
        }
    };

    const editCategory = async (oldName: string, newName: string) => {
        try {
            await PuzzleService.editCategory(oldName, newName);
            const puzzles = await PuzzleService.getPuzzles();
            dispatch({ type: 'INITIALIZE_DATA', payload: { ...state, puzzles, players: state.players, achievements: state.achievements } });
            addToast('Category updated successfully');
        } catch (error: any) {
            addToast(error.message || 'Error updating category', 'error');
        }
    };

    const deleteCategory = async (name: string) => {
        try {
            await PuzzleService.deleteCategory(name);
            const puzzles = await PuzzleService.getPuzzles();
            dispatch({ type: 'INITIALIZE_DATA', payload: { ...state, puzzles, players: state.players, achievements: state.achievements } });
            addToast('Category deleted successfully');
        } catch (error: any) {
            addToast(error.message || 'Error deleting category', 'error');
        }
    };
    
    const deletePlayer = async (id: string) => {
        await Auth.deleteUser(id);
        const players = await Auth.getPlayers();
        dispatch({ type: 'INITIALIZE_DATA', payload: { ...state, players, puzzles: state.puzzles, achievements: state.achievements } });
        addToast('Player deleted successfully');
    };

    const resetPlayerProgress = async (id: string) => {
        await Auth.resetUserProgress(id);
        const players = await Auth.getPlayers();
        const loggedInUser = await Auth.getLoggedInUser();
        dispatch({ type: 'INITIALIZE_DATA', payload: { ...state, players, puzzles: state.puzzles, achievements: state.achievements } });
        if (loggedInUser && loggedInUser.id === id) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: loggedInUser });
        }
        addToast('Player progress reset');
    };

    const completePuzzle = async (puzzleId: string, points: number, xpValue: number) => {
        if (!state.user || state.user.solvedPuzzleIds.includes(puzzleId)) {
            return;
        }

        const currentTotalXp = Auth.calculateTotalXp(state.user.level, state.user.xp);
        const newTotalXp = currentTotalXp + xpValue;
        const { level: newLevel, xpInLevel: newXpInLevel, xpToNextLevel: newXpToNextLevel } = Auth.calculateLevel(newTotalXp);

        const updatedUserBase = {
            ...state.user,
            points: (state.user.points || 0) + points,
            xp: newXpInLevel,
            level: newLevel,
            xpToNextLevel: newXpToNextLevel,
            solvedPuzzleIds: [...state.user.solvedPuzzleIds, puzzleId],
        };
        
        // Check for new achievements
        const earnedAchievements = AchievementService.checkAchievements(updatedUserBase, state.achievements);
        const finalUpdatedUser = { ...updatedUserBase };

        if (earnedAchievements.length > 0) {
            finalUpdatedUser.achievements = [
                ...updatedUserBase.achievements,
                ...earnedAchievements.map(a => a.id)
            ];
            // Unique set to prevent any DB constraint issues
            finalUpdatedUser.achievements = Array.from(new Set(finalUpdatedUser.achievements));

            earnedAchievements.forEach((ach, index) => {
                setTimeout(() => {
                    addToast(`Achievement Unlocked: ${ach.name}! 🎉`, 'success');
                }, index * 150);
            });
        }

        try {
            await Auth.updateUser(finalUpdatedUser);
            // Update local state immediately for responsiveness
            dispatch({ type: 'LOGIN_SUCCESS', payload: finalUpdatedUser });
            
            if (newLevel > state.user.level) {
                addToast(`Level Up! You are now level ${newLevel}! 🎊`, 'success');
            }
        } catch (error) {
            console.error('Failed to update user after puzzle completion:', error);
            addToast('Correct, but failed to save progress. Please try again.', 'error');
        }
    };

    const addAchievement = async (achievement: Achievement) => {
        try {
            await AchievementService.addAchievement(achievement);
            const achievements = await AchievementService.getAchievements();
            dispatch({ type: 'INITIALIZE_DATA', payload: { ...state, achievements, puzzles: state.puzzles, players: state.players } });
            addToast('Achievement added successfully');
        } catch (error: any) {
            addToast(error.message || 'Error adding achievement', 'error');
        }
    };

    const editAchievement = async (achievement: Achievement) => {
        try {
            await AchievementService.editAchievement(achievement);
            const achievements = await AchievementService.getAchievements();
            dispatch({ type: 'INITIALIZE_DATA', payload: { ...state, achievements, puzzles: state.puzzles, players: state.players } });
            addToast('Achievement updated successfully');
        } catch (error: any) {
            addToast(error.message || 'Error updating achievement', 'error');
        }
    };

    const deleteAchievement = async (id: string) => {
        try {
            await AchievementService.deleteAchievement(id);
            const achievements = await AchievementService.getAchievements();
            dispatch({ type: 'INITIALIZE_DATA', payload: { ...state, achievements, puzzles: state.puzzles, players: state.players } });
            addToast('Achievement deleted successfully');
        } catch (error: any) {
            addToast(error.message || 'Error deleting achievement', 'error');
        }
    };

    const deductPoints = async (pointsToDeduct: number, reason: string = 'deduction'): Promise<boolean> => {
        if (!state.user) return false;
        if (state.user.points < pointsToDeduct) {
            addToast(`Not enough points. You need ${pointsToDeduct} points but have ${state.user.points}.`, 'error');
            return false;
        }

        const updatedUser = {
            ...state.user,
            points: state.user.points - pointsToDeduct
        };

        try {
            await Auth.updateUser(updatedUser);
            dispatch({ type: 'LOGIN_SUCCESS', payload: updatedUser });
            addToast(`-${pointsToDeduct} Points (${reason})`, 'success');
            return true;
        } catch (error) {
            console.error('Failed to deduct points:', error);
            addToast('An error occurred. Please try again.', 'error');
            return false;
        }
    };

    const updateCertificateRequirements = async (req: CertificateRequirements) => {
        // Save to DB and fallback to local storage
        await SettingsService.saveSettings(req);
        localStorage.setItem('applet_certificate_req', JSON.stringify(req));
        dispatch({ type: 'SET_CERTIFICATE_REQUIREMENTS', payload: req });
        addToast('Certificate requirements updated successfully.');
    };

    return (
        <AppContext.Provider value={{ 
            state, 
            dispatch, 
            login: Auth.login, 
            signup: Auth.signup, 
            logout, 
            selectCategory, 
            addToast, 
            addPuzzle, 
            editPuzzle, 
            deletePuzzle, 
            addCategory, 
            editCategory, 
            deleteCategory, 
            deletePlayer, 
            resetPlayerProgress,
            completePuzzle,
            addAchievement,
            editAchievement,
            deleteAchievement,
            deductPoints,
            updateCertificateRequirements
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);