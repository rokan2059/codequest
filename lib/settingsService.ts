import { CertificateRequirements } from '../context/AppContext';
import { supabase } from './supabase';

const SETTINGS_ID = '__APPLET_SETTINGS__';

export const loadSettings = async (): Promise<CertificateRequirements | null> => {
    try {
        const { data, error } = await supabase
            .from('achievements')
            .select('description')
            .eq('id', SETTINGS_ID)
            .single();

        if (error) {
            return null; // Doesn't exist yet
        }

        if (data && data.description) {
            const parsed = JSON.parse(data.description);
            if (parsed.applet_certificate_req) {
                return parsed.applet_certificate_req as CertificateRequirements;
            }
        }
    } catch (err) {
        console.error('Failed to load settings from DB', err);
    }
    return null;
};

export const saveSettings = async (req: CertificateRequirements): Promise<void> => {
    try {
        const descriptionPayload = JSON.stringify({ applet_certificate_req: req });

        // Try to update first
        const { data, error } = await supabase
            .from('achievements')
            .update({ description: descriptionPayload })
            .eq('id', SETTINGS_ID)
            .select();

        // If up to date failed because row doesn't exist, insert
        if (error || !data || data.length === 0) {
            const { error: insertError } = await supabase
                .from('achievements')
                .insert([{
                    id: SETTINGS_ID,
                    name: 'System Settings',
                    description: descriptionPayload,
                    icon: '⚙️',
                    required_puzzles: 999999
                }]);
            
            if (insertError) {
                console.error("Error inserting settings", insertError);
            }
        }
    } catch (err) {
        console.error('Failed to save settings to DB', err);
    }
};
