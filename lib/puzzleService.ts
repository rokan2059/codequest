import { Puzzle } from './types';
import { supabase } from './supabase';

// Function to get puzzles from Supabase
export const getPuzzles = async (): Promise<Record<string, Puzzle[]>> => {
    const { data, error } = await supabase
        .from('puzzles')
        .select('*');
    
    if (error) {
        console.error('Error fetching puzzles:', error);
        throw error;
    }

    const puzzlesByCategory: Record<string, Puzzle[]> = {};
    
    data.forEach(p => {
        const puzzle: Puzzle = {
            id: p.id,
            title: p.title,
            difficulty: p.difficulty as any,
            points: p.points,
            xp: p.xp,
            description: p.description,
            code: p.code,
            answer: p.answer,
            category: p.category,
            requiredLevel: p.required_level
        };

        if (!puzzlesByCategory[p.category]) {
            puzzlesByCategory[p.category] = [];
        }
        puzzlesByCategory[p.category].push(puzzle);
    });

    return puzzlesByCategory;
};

// Function to add a new puzzle to Supabase
export const addPuzzle = async (newPuzzle: Puzzle): Promise<void> => {
    const { error } = await supabase
        .from('puzzles')
        .insert([{
            id: newPuzzle.id,
            title: newPuzzle.title,
            difficulty: newPuzzle.difficulty,
            points: newPuzzle.points,
            xp: newPuzzle.xp,
            description: newPuzzle.description,
            code: newPuzzle.code,
            answer: newPuzzle.answer,
            category: newPuzzle.category,
            required_level: newPuzzle.requiredLevel || 1
        }]);

    if (error) {
        console.error('Error adding puzzle:', error);
        throw error;
    }
};

export const editPuzzle = async (updatedPuzzle: Puzzle): Promise<void> => {
    const { error } = await supabase
        .from('puzzles')
        .update({
            title: updatedPuzzle.title,
            difficulty: updatedPuzzle.difficulty,
            points: updatedPuzzle.points,
            xp: updatedPuzzle.xp,
            description: updatedPuzzle.description,
            code: updatedPuzzle.code,
            answer: updatedPuzzle.answer,
            category: updatedPuzzle.category,
            required_level: updatedPuzzle.requiredLevel || 1
        })
        .eq('id', updatedPuzzle.id);

    if (error) {
        console.error('Error updating puzzle:', error);
        throw error;
    }
};

export const deletePuzzle = async (puzzleId: string): Promise<void> => {
    const { error } = await supabase
        .from('puzzles')
        .delete()
        .eq('id', puzzleId);

    if (error) {
        console.error('Error deleting puzzle:', error);
        throw error;
    }
};

export const addCategory = async (categoryName: string): Promise<void> => {
    // In SQL, categories are derived from the 'category' field in puzzles.
    // However, if we want "empty" categories, we might need a separate table.
    // For now, we'll just handle it by ensuring one puzzle exists or by UI logic.
    console.log('Category creation is handled by adding a puzzle with that category.');
};

export const editCategory = async (oldName: string, newName: string): Promise<void> => {
    const { error } = await supabase
        .from('puzzles')
        .update({ category: newName })
        .eq('category', oldName);

    if (error) {
        console.error('Error editing category:', error);
        throw error;
    }
};

export const deleteCategory = async (categoryName: string): Promise<void> => {
    const { error } = await supabase
        .from('puzzles')
        .delete()
        .eq('category', categoryName);

    if (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
};
