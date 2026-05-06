
export type View = 'login' | 'admin_dashboard' | 'player_dashboard' | 'puzzles' | 'leaderboard' | 'profile' | 'puzzle_view' | 'reset_password';

export interface Puzzle {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    points: number;
    xp: number;
    description: string;
    code: string;
    answer: string;
    category: string;
    requiredLevel?: number;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    imageUrl?: string;
    requiredPuzzles: number;
}

export interface User {
    id: string;
    email: string;
    role: 'player' | 'admin';
    points: number;
    xp: number;
    level: number;
    xpToNextLevel: number;
    solvedPuzzleIds: string[];
    achievements: string[]; // Array of achievement IDs
    created_at?: string;
}
