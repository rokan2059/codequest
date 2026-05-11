import { User } from './types';
import { supabase } from './supabase';

export const calculateLevel = (totalXp: number) => {
    let level = 1;
    let requiredXpForLevel = 150; // Level 1 cap
    let xp = totalXp;

    while (xp >= requiredXpForLevel) {
        xp -= requiredXpForLevel;
        level++;
        requiredXpForLevel += 50; // Each level adds 50 to cap
    }
    
    return { level, xpInLevel: xp, xpToNextLevel: requiredXpForLevel };
};

export const calculateTotalXp = (level: number, xpInLevel: number) => {
    let totalXp = 0;
    let currentCap = 150;
    
    for (let i = 1; i < level; i++) {
        totalXp += currentCap;
        currentCap += 50;
    }
    
    return totalXp + xpInLevel;
};

export const getPlayers = async (): Promise<User[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*');
    
    if (error) {
        console.error('Error fetching players:', error);
        return [];
    }

    return data.map(profile => ({
        id: profile.id,
        email: profile.email,
        role: profile.role,
        points: profile.points,
        xp: profile.xp,
        level: profile.level,
        xpToNextLevel: calculateLevel(calculateTotalXp(profile.level, profile.xp)).xpToNextLevel,
        solvedPuzzleIds: profile.solved_puzzle_ids || [],
        achievements: profile.achievement_ids || [],
        avatarUrl: profile.avatar_url,
        created_at: profile.created_at
    }));
};

export const login = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError) {
        return { success: false, message: authError.message };
    }

    const { data: profileNode, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    if (profileError) {
        return { success: false, message: 'Profile not found.' };
    }

    const levelInfo = calculateLevel(calculateTotalXp(profileNode.level, profileNode.xp));

    const user: User = {
        id: profileNode.id,
        email: profileNode.email,
        role: profileNode.role,
        points: profileNode.points,
        xp: profileNode.xp,
        level: profileNode.level,
        xpToNextLevel: levelInfo.xpToNextLevel,
        solvedPuzzleIds: profileNode.solved_puzzle_ids || [],
        achievements: profileNode.achievement_ids || [],
        avatarUrl: profileNode.avatar_url,
        created_at: profileNode.created_at
    };

    return { success: true, message: 'Login successful!', user };
};

export const signup = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: 'https://codequest-dodv.onrender.com/'
        }
    });

    if (error) {
        return { success: false, message: error.message };
    }

    return { success: true, message: 'Account created successfully! Please check your email for verification.' };
};

export const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://codequest-dodv.onrender.com/',
    });
    if (error) throw error;
    return { success: true, message: 'Password reset link sent to your email.' };
};

export const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });
    if (error) throw error;
    return { success: true, message: 'Password updated successfully.' };
};

export const logout = async () => {
    await supabase.auth.signOut();
};

export const getLoggedInUser = async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (error || !profile) return null;

    const levelInfo = calculateLevel(calculateTotalXp(profile.level, profile.xp));

    return {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        points: profile.points,
        xp: profile.xp,
        level: profile.level,
        xpToNextLevel: levelInfo.xpToNextLevel,
        solvedPuzzleIds: profile.solved_puzzle_ids || [],
        achievements: profile.achievement_ids || [],
        avatarUrl: profile.avatar_url,
        created_at: profile.created_at,
        certificate_id: profile.certificate_id,
        certificate_name: profile.certificate_name,
        certificate_issued_at: profile.certificate_issued_at
    };
};

export const updateUser = async (updatedUser: User) => {
    const levelInfo = calculateLevel(calculateTotalXp(updatedUser.level, updatedUser.xp));
    
    const { error } = await supabase
        .from('profiles')
        .update({
            points: updatedUser.points,
            xp: updatedUser.xp,
            level: levelInfo.level,
            solved_puzzle_ids: updatedUser.solvedPuzzleIds,
            achievement_ids: updatedUser.achievements,
            avatar_url: updatedUser.avatarUrl,
            certificate_id: updatedUser.certificate_id,
            certificate_name: updatedUser.certificate_name,
            certificate_issued_at: updatedUser.certificate_issued_at,
            updated_at: new Date().toISOString()
        })
        .eq('id', updatedUser.id);

    if (error) {
        console.error('Error updating profile:', error);
    }
};

export const makeUserAdmin = async (userId: string) => {
    const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);
    
    if (error) {
        console.error('Error making user admin:', error);
        throw error;
    }
};

export const deleteUser = async (userId: string): Promise<void> => {
    // Note: Deleting from auth.users requires admin privileges or specific setup.
    // For now, we'll just delete the profile.
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
    
    if (error) console.error('Error deleting profile:', error);
};

export const resetUserProgress = async (userId: string): Promise<void> => {
    const { error } = await supabase
        .from('profiles')
        .update({
            points: 0,
            xp: 0,
            level: 1,
            solved_puzzle_ids: [],
            achievement_ids: []
        })
        .eq('id', userId);
    
    if (error) console.error('Error resetting progress:', error);
};
