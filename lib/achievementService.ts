import { Achievement, User } from './types';
import { supabase } from './supabase';
import { achievements as defaultAchievements } from '../data/achievements';

export const getAchievements = async (): Promise<Achievement[]> => {
    const { data, error } = await supabase
        .from('achievements')
        .select('*');
    
    if (error) {
        console.error('Error fetching achievements:', error);
        throw error;
    }

    if (!data || data.length === 0) {
        const achievementsToInsert = defaultAchievements.map(a => ({
            id: a.id,
            name: a.name,
            description: a.description,
            icon: a.icon,
            image_url: a.imageUrl,
            required_puzzles: a.requiredPuzzles
        }));
        
        const { error: seedError } = await supabase.from('achievements').insert(achievementsToInsert);
        if (seedError) console.error('Error seeding achievements:', seedError);
        
        return defaultAchievements;
    }

    return data.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        imageUrl: a.image_url,
        requiredPuzzles: a.required_puzzles
    }));
};

export const checkAchievements = (user: User, allAchievements: Achievement[]): Achievement[] => {
    const earned: Achievement[] = [];
    
    const alreadyEarned = (id: string) => (user.achievements || []).includes(id);

    allAchievements.forEach(ach => {
        if (!alreadyEarned(ach.id) && (user.solvedPuzzleIds || []).length >= ach.requiredPuzzles) {
            earned.push(ach);
        }
    });
    
    return earned;
};

export const addAchievement = async (achievement: Achievement): Promise<void> => {
    const { error } = await supabase
        .from('achievements')
        .insert([{
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            image_url: achievement.imageUrl,
            required_puzzles: achievement.requiredPuzzles
        }]);

    if (error) {
        console.error('Error adding achievement:', error);
        throw error;
    }
};

export const editAchievement = async (achievement: Achievement): Promise<void> => {
    const { error } = await supabase
        .from('achievements')
        .update({
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            image_url: achievement.imageUrl,
            required_puzzles: achievement.requiredPuzzles
        })
        .eq('id', achievement.id);

    if (error) {
        console.error('Error updating achievement:', error);
        throw error;
    }
};

export const deleteAchievement = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting achievement:', error);
        throw error;
    }
};
