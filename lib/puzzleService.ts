import { Puzzle } from './types';
import { supabase } from './supabase';
import { puzzles as defaultPuzzles } from '../data/puzzles';

// Function to get puzzles from Supabase
export const getPuzzles = async (): Promise<Record<string, Puzzle[]>> => {
    // Fetch categories first to ensure empty categories are included
    const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*');
        
    if (categoryError) {
        console.error('Error fetching categories:', categoryError);
        throw categoryError;
    }
    
    // Seed initial data if empty
    let currentCategoryData = categoryData || [];
    if (!currentCategoryData || currentCategoryData.length === 0) {
        // Insert categories
        const categories = Object.keys(defaultPuzzles).map(name => ({ name }));
        const { error: seedCatError } = await supabase.from('categories').insert(categories);
        if (seedCatError) console.error('Error seed categories', seedCatError);
        
        // Refresh category data
        const { data: newCatData } = await supabase.from('categories').select('*');
        if (newCatData) currentCategoryData = newCatData;
    }

    const puzzlesByCategory: Record<string, Puzzle[]> = {};
    currentCategoryData.forEach(c => {
        puzzlesByCategory[c.name] = [];
    });

    const { data, error } = await supabase
        .from('puzzles')
        .select('*');
    
    if (error) {
        console.error('Error fetching puzzles:', error);
        throw error;
    }

    let finalPuzzleData = data || [];

    if (!finalPuzzleData || finalPuzzleData.length === 0) {
        // Insert puzzles
        const puzzlesToInsert = [];
        for (const [category, puzzleList] of Object.entries(defaultPuzzles)) {
            for (const p of puzzleList) {
                puzzlesToInsert.push({
                    id: p.id,
                    title: p.title,
                    difficulty: p.difficulty,
                    points: p.points,
                    xp: p.xp,
                    description: p.description,
                    code: p.code,
                    answer: p.answer,
                    category: p.category,
                    required_level: p.requiredLevel || 1
                });
            }
        }
        const { error: seedPuzError } = await supabase.from('puzzles').insert(puzzlesToInsert);
        if (seedPuzError) console.error('Error seed puzzles', seedPuzError);
        
        // Refresh puzzle data
        const { data: newPuzData } = await supabase.from('puzzles').select('*');
        if (newPuzData) finalPuzzleData = newPuzData;
    }

    finalPuzzleData.forEach((p: any) => {
        const puzzle: Puzzle = {
            id: p.id,
            title: p.title,
            difficulty: p.difficulty,
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
    const { data, error } = await supabase
        .from('puzzles')
        .delete()
        .eq('id', puzzleId)
        .select();

    if (error) {
        console.error('Error deleting puzzle:', error);
        throw new Error(`Supabase error: ${error.message} (${error.details || ''})`);
    }

    if (!data || data.length === 0) {
        throw new Error("Unable to delete puzzle. (0 rows deleted - RLS or puzzle not found). puzzleId=" + puzzleId);
    }
};

export const addCategory = async (categoryName: string): Promise<void> => {
    const { error } = await supabase
        .from('categories')
        .insert([{ name: categoryName }]);

    if (error) {
        console.error('Error adding category:', error);
        throw error;
    }
};

export const editCategory = async (oldName: string, newName: string): Promise<void> => {
    // Because we set ON UPDATE CASCADE, changing the category name here will update all puzzles too.
    const { error } = await supabase
        .from('categories')
        .update({ name: newName })
        .eq('name', oldName);

    if (error) {
        console.error('Error editing category:', error);
        throw error;
    }
};

export const deleteCategory = async (categoryName: string): Promise<void> => {
    // Because we set ON DELETE CASCADE, deleting the category will delete all its puzzles.
    const { data, error } = await supabase
        .from('categories')
        .delete()
        .eq('name', categoryName)
        .select();

    if (error) {
        console.error('Error deleting category:', error);
        throw error;
    }

    if (!data || data.length === 0) {
        throw new Error("Unable to delete category. Check your permissions.");
    }
};
