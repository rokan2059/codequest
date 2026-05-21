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
        username: profile.username,
        username_changes: profile.username_changes || 0,
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

    let { data: profileNode, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    if (profileError || !profileNode) {
        console.warn('Profile missing on login, creating fallback...');
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([{ 
                id: authData.user.id, 
                email: authData.user.email,
                username: authData.user.user_metadata?.username,
                role: 'player'
            }])
            .select()
            .single();
        
        if (insertError) {
            return { success: false, message: 'Profile not found and could not be created.' };
        }
        profileNode = newProfile;
    } else if (!profileNode.username && authData.user.user_metadata?.username) {
        // Sync username if missing in profile but present in metadata
        const { data: updatedProfile } = await supabase
            .from('profiles')
            .update({ username: authData.user.user_metadata.username })
            .eq('id', authData.user.id)
            .select()
            .single();
        if (updatedProfile) {
            profileNode = updatedProfile;
        }
    }

    const levelInfo = calculateLevel(calculateTotalXp(profileNode.level || 1, profileNode.xp || 0));

    const user: User = {
        id: profileNode.id,
        email: profileNode.email,
        role: profileNode.role,
        points: profileNode.points || 0,
        xp: profileNode.xp || 0,
        level: profileNode.level || 1,
        xpToNextLevel: levelInfo.xpToNextLevel,
        solvedPuzzleIds: profileNode.solved_puzzle_ids || [],
        achievements: profileNode.achievement_ids || [],
        username: profileNode.username,
        username_changes: profileNode.username_changes || 0,
        avatarUrl: profileNode.avatar_url,
        created_at: profileNode.created_at
    };

    return { success: true, message: 'Login successful!', user };
};

export const signup = async (email: string, password: string, username: string): Promise<{ success: boolean; message: string }> => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://codequest.arena';
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/`,
            data: {
                username: username
            }
        }
    });

    if (error) {
        return { success: false, message: error.message };
    }

    return { success: true, message: 'Account created successfully! Please check your email for verification.' };
};

export const resetPassword = async (email: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://codequest.arena';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/`,
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

const clearSupabaseKeys = () => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem('supabase.auth.token');
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth-token'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(k => {
            try {
                localStorage.removeItem(k);
            } catch (e) {}
        });
    } catch (e) {
        console.error('Failed to clear Supabase localStorage keys:', e);
    }
};

export const getLoggedInUser = async (): Promise<User | null> => {
    try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
            console.warn('getLoggedInUser: Error getting supabase session, cleaning up:', error);
            // If the error message indicates issues with Refresh Token or Invalid Grant, purge localStorage keys to stop repetitive errors on page refresh
            if (
                error.message?.toLowerCase().includes('refresh token') || 
                error.message?.toLowerCase().includes('invalid') || 
                error.message?.toLowerCase().includes('grant') ||
                error.status === 400 || 
                error.status === 401
            ) {
                try {
                    await supabase.auth.signOut().catch(() => {});
                } catch (e) {}
                clearSupabaseKeys();
            }
            return null;
        }

        const session = data?.session;
        if (!session) return null;

        let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (profileError || !profile) {
            console.warn('Profile missing for user, attempting to create one...', session.user.id);
            // Fallback: If profile doesn't exist, try to create it (logic from trigger)
            const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert([{ 
                    id: session.user.id, 
                    email: session.user.email,
                    username: session.user.user_metadata?.username,
                    role: 'player'
                }])
                .select()
                .single();
            
            if (insertError) {
                console.error('Failed to create fallback profile:', insertError);
                return null;
            }
            profile = newProfile;
        } else if (!profile.username && session.user.user_metadata?.username) {
            // Sync username if missing in profile but present in metadata
            const { data: updatedProfile } = await supabase
                .from('profiles')
                .update({ username: session.user.user_metadata.username })
                .eq('id', session.user.id)
                .select()
                .single();
            if (updatedProfile) {
                profile = updatedProfile;
            }
        }

        const levelInfo = calculateLevel(calculateTotalXp(profile.level || 1, profile.xp || 0));

        return {
            id: profile.id,
            email: profile.email,
            role: profile.role,
            points: profile.points || 0,
            xp: profile.xp || 0,
            level: profile.level || 1,
            xpToNextLevel: levelInfo.xpToNextLevel,
            solvedPuzzleIds: profile.solved_puzzle_ids || [],
            achievements: profile.achievement_ids || [],
            username: profile.username,
            username_changes: profile.username_changes || 0,
            avatarUrl: profile.avatar_url,
            created_at: profile.created_at,
            certificate_id: profile.certificate_id,
            certificate_name: profile.certificate_name,
            certificate_issued_at: profile.certificate_issued_at
        };
    } catch (e) {
        console.error('Error in getLoggedInUser:', e);
        return null;
    }
};

export const updateUser = async (updatedUser: User) => {
    const levelInfo = calculateLevel(calculateTotalXp(updatedUser.level, updatedUser.xp));
    
    const updateData: any = {
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
    };

    const { error } = await supabase
        .from('profiles')
        .update(updateData)
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
            achievement_ids: [],
            certificate_id: null,
            certificate_name: null,
            certificate_issued_at: null
        })
        .eq('id', userId);
    
    if (error) console.error('Error resetting progress:', error);
};
