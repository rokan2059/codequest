import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const VerifyCertificate: React.FC = () => {
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
    const [certData, setCertData] = useState<any>(null);

    useEffect(() => {
        const verify = async () => {
            const params = new URLSearchParams(window.location.search);
            const verifyId = params.get('verify_cert');

            if (!verifyId) {
                setStatus('invalid');
                return;
            }

            try {
                // To look up a certificate by ID across all profiles, we need a query.
                // Normally this might be restricted by RLS. But since profiles are viewable by everyone in our RLS:
                // CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('email, certificate_name, certificate_issued_at, level')
                    .eq('certificate_id', verifyId)
                    .single();

                if (error || !data || !data.certificate_name) {
                    setStatus('invalid');
                } else {
                    setCertData(data);
                    setStatus('valid');
                }
            } catch (err) {
                console.error(err);
                setStatus('invalid');
            }
        };

        verify();
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    if (status === 'invalid') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-800 p-8 rounded-2xl max-w-md w-full border border-red-500/30 text-center shadow-2xl"
                >
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Invalid Certificate</h2>
                    <p className="text-slate-400 mb-6">We could not find a valid certificate with this identifier. It may be forged or the ID is incorrect.</p>
                    <a href="/" className="text-sky-400 hover:text-sky-300 font-medium">Return to Homepage</a>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-800 p-8 rounded-2xl max-w-md w-full border border-emerald-500/30 text-center shadow-2xl"
            >
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-emerald-400">Verified Authentic</h2>
                <p className="text-slate-400 mb-8">This certificate was genuinely issued by CodeQuest and its details are secured in our database.</p>
                
                <div className="bg-slate-900/50 rounded-xl p-6 text-left border border-slate-700 space-y-4">
                    <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Issued To</p>
                        <p className="text-lg font-medium text-slate-200">{certData.certificate_name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Account</p>
                        <p className="text-md text-slate-300">{certData.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Achieved Level</p>
                        <p className="text-md text-slate-300">Level {certData.level}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Issue Date</p>
                        <p className="text-md text-slate-300">{new Date(certData.certificate_issued_at).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="mt-8">
                    <a href="/" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors inline-block">
                        Return to Platform
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyCertificate;
