import { Achievement } from '../lib/types';

export const achievements: Achievement[] = [
    { id: 'ach1', name: 'First Steps', description: 'Solved your first puzzle.', icon: '🌟', requiredPuzzles: 1 },
    { id: 'ach2', name: 'Array Adept', description: 'Solved an array puzzle.', icon: '⛓️', requiredPuzzles: 2 },
    { id: 'ach3', name: 'Point Collector', description: 'Earned 100 points.', icon: '💰', requiredPuzzles: 3 },
    { id: 'ach4', name: 'Async Ace', description: 'Solved an async puzzle.', icon: '⚡', requiredPuzzles: 5 },
];
