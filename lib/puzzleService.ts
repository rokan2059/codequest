import { Puzzle } from './types';
import { supabase } from './supabase';

// Function to get puzzles from Supabase
export const getPuzzles = async (): Promise<Record<string, Puzzle[]>> => {
    // Fetch all puzzles
    const { data: puzzlesData, error: puzzlesError } = await supabase
        .from('puzzles')
        .select('*');
    
    if (puzzlesError) {
        console.error('Error fetching puzzles:', puzzlesError);
        throw puzzlesError;
    }

    // Try to fetch all categories (new table)
    const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('name');

    const puzzlesByCategory: Record<string, Puzzle[]> = {};
    
    // Initialize with empty categories if table exists
    if (!categoriesError && categoriesData) {
        categoriesData.forEach(cat => {
            puzzlesByCategory[cat.name] = [];
        });
    }

    // Process puzzles and populate categories
    puzzlesData.forEach(p => {
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
    // Ensure the category exists in the categories table first
    await addCategory(newPuzzle.category);

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
    // Ensure the category exists in the categories table
    await addCategory(updatedPuzzle.category);

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
    const { error } = await supabase
        .from('categories')
        .insert([{ name: categoryName }])
        .select()
        .single();

    // If error is code '23505' it means it already exists (Unique constraint violation)
    // We can ignore that.
    if (error) {
        if ((error as any).code === '23505') return;
        
        console.error('Error adding category:', error);
        throw error;
    }
};

export const editCategory = async (oldName: string, newName: string): Promise<void> => {
    // 1. Update the categories table first
    const { error: catError } = await supabase
        .from('categories')
        .update({ name: newName })
        .eq('name', oldName);

    if (catError) {
        console.error('Error editing category name:', catError);
        // If categories table doesn't exist, we might still want to update puzzles
    }

    // 2. Update all puzzles in this category
    const { error: puzzleError } = await supabase
        .from('puzzles')
        .update({ category: newName })
        .eq('category', oldName);

    if (puzzleError) {
        console.error('Error updating puzzles category:', puzzleError);
        throw puzzleError;
    }
};

export const deleteCategory = async (categoryName: string): Promise<void> => {
    // 1. Delete all puzzles in this category (Supabase might handle this if cascade is set, but let's be explicit)
    const { error: puzzleError } = await supabase
        .from('puzzles')
        .delete()
        .eq('category', categoryName);

    if (puzzleError) {
        console.error('Error deleting puzzles in category:', puzzleError);
        throw puzzleError;
    }

    // 2. Delete the category itself
    const { error: catError } = await supabase
        .from('categories')
        .delete()
        .eq('name', categoryName);

    if (catError) {
        console.error('Error deleting category:', catError);
    }
};
