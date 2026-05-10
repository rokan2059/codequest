import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../lib/types';
import confetti from 'canvas-confetti';
import { useAppContext } from '../context/AppContext';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface CertificateModalProps {
    user: User;
    onClose: () => void;
}

const CertificateModal: React.FC<CertificateModalProps> = ({ user, onClose }) => {
    const certificateRef = useRef<HTMLDivElement>(null);
    const { state } = useAppContext();
    const { certificateRequirements } = state;
    const [name, setName] = useState(user.certificate_name || '');
    const [nameSubmitted, setNameSubmitted] = useState(!!user.certificate_name);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const { dispatch } = useAppContext();

    const isQualified = user.level >= certificateRequirements.level && user.solvedPuzzleIds.length >= certificateRequirements.puzzles;

    React.useEffect(() => {
        // Celebrate with confetti when opening the certificate
        if (isQualified && nameSubmitted && !user.certificate_id) {
            confetti({
                particleCount: 200,
                spread: 90,
                origin: { y: 0.6 }
            });
        }
    }, [isQualified, nameSubmitted, user.certificate_id]);

    const printCertificate = async () => {
        if (!certificateRef.current) return;
        
        try {
            setIsGeneratingPdf(true);
            const dataUrl = await toPng(certificateRef.current, {
                quality: 1,
                pixelRatio: 2, // High resolution
                backgroundColor: '#ffffff'
            });
            
            // Calculate PDF dimensions (landscape A4)
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                // jsPDF needs fixed formatting or it may stretch, we'll use the element's client dimensions
                format: [certificateRef.current.offsetWidth, certificateRef.current.offsetHeight]
            });
            
            pdf.addImage(dataUrl, 'PNG', 0, 0, certificateRef.current.offsetWidth, certificateRef.current.offsetHeight);
            pdf.save(`CodeQuest-Certificate-${name.replace(/\s+/g, '-')}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert("Failed to generate PDF. You can also try right-clicking the certificate to save it as an image.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && !user.certificate_id) {
            setIsSaving(true);
            try {
                const certId = window.crypto.randomUUID();
                const issuedAt = new Date().toISOString();
                
                const updatedUser = {
                    ...user,
                    certificate_id: certId,
                    certificate_name: name.trim(),
                    certificate_issued_at: issuedAt
                };
                
                // Supabase will throw error if columns are missing until admin updates the schema
                const { updateUser } = await import('../lib/auth');
                await updateUser(updatedUser);
                
                dispatch({ type: 'SET_USER', payload: updatedUser });
                setNameSubmitted(true);
            } catch (err) {
                console.error(err);
                alert("Failed to save certificate. Make sure the database schema is updated.");
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:p-0 print:bg-white"
            >
                <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col relative print:border-none print:shadow-none print:w-[100vw] print:h-[100vh] print:max-h-none print:max-w-none print:bg-white">
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 print:hidden bg-slate-800 p-2 rounded-full"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    
                    <div className="flex-1 overflow-auto min-h-[400px] flex items-center justify-center p-4 md:p-8 print:p-0">
                        {isQualified ? (
                            nameSubmitted ? (
                                <div className="max-w-full overflow-x-auto flex justify-start md:justify-center">
                                    <div 
                                        ref={certificateRef}
                                        className="bg-white text-slate-900 w-[800px] min-h-[566px] min-w-[800px] shrink-0 relative border-[16px] border-double border-slate-800 p-12 flex flex-col items-center justify-center text-center shadow-inner"
                                        style={{
                                            backgroundImage: 'radial-gradient(circle at center, #ffffff 0%, #f1f5f9 100%)',
                                        }}
                                    >
                                        <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-slate-800"></div>
                                        <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-slate-800"></div>
                                        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-slate-800"></div>
                                        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-slate-800"></div>
                                        
                                        <div className="text-yellow-500 mb-6 font-serif mt-4">
                                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                        </div>

                                        <h1 className="text-4xl font-extrabold uppercase tracking-widest text-slate-800 mb-2 font-serif">
                                            Certificate of Achievement
                                        </h1>
                                        <p className="text-lg text-slate-600 font-medium mb-10 tracking-widest uppercase">
                                            CodeQuest Arena
                                        </p>

                                        <p className="text-xl text-slate-700 italic mb-4">
                                            This certifies that
                                        </p>

                                        <div className="text-4xl font-bold text-slate-900 border-b-2 border-slate-300 pb-2 px-12 mb-8 inline-block max-w-[80%] whitespace-nowrap overflow-hidden text-ellipsis">
                                            {name.trim()}
                                        </div>

                                        <p className="text-lg text-slate-700 mb-8 max-w-xl leading-relaxed">
                                            Has successfully reached Level {user.level} and solved {user.solvedPuzzleIds.length} challenging coding puzzles, demonstrating exceptional logical thinking and algorithmic problem-solving skills.
                                        </p>

                                        <div className="flex justify-between w-full max-w-xl mt-4 pt-8 px-8 mb-12">
                                            <div className="text-center">
                                                <div className="border-b border-slate-500 w-40 mb-2 font-serif italic text-xl">
                                                    Admin
                                                </div>
                                                <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Head Instructor</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="border-b border-slate-500 w-40 mb-2 font-mono text-lg">
                                                    {user.certificate_issued_at ? new Date(user.certificate_issued_at).toLocaleDateString() : new Date().toLocaleDateString()}
                                                </div>
                                                <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Date Issued</div>
                                            </div>
                                        </div>
                                        
                                        {/* Verification Footer */}
                                        {user.certificate_id && (
                                            <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 px-12">
                                                <div className="flex-shrink-0 bg-white p-1 rounded border border-slate-200">
                                                    <QRCode 
                                                        value={`https://codequest.app/verify/${user.certificate_id}`}
                                                        size={56}
                                                        level="L"
                                                    />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1">Authenticity Verification</p>
                                                    <p className="text-[10px] text-slate-400 font-mono break-all max-w-[200px]">ID: {user.certificate_id}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono max-w-[250px]">Verify at: codequest.app/verify</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <form 
                                    onSubmit={handleNameSubmit} 
                                    className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl max-w-md w-full"
                                >
                                    <h2 className="text-2xl font-bold text-slate-100 mb-2">Claim Your Certificate</h2>
                                    <p className="text-slate-400 mb-6">Congratulations on qualifying! What name should we print on your certificate?</p>
                                    
                                    <div className="mb-6">
                                        <label htmlFor="certificateName" className="block text-sm font-medium text-slate-300 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="certificateName"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Jane Doe"
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                            autoFocus
                                            required
                                        />
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={!name.trim() || isSaving}
                                        className="w-full px-6 py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md transition-colors flex justify-center items-center gap-2"
                                    >
                                        {isSaving && <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>}
                                        Generate Certificate
                                    </button>
                                </form>
                            )
                        ) : (
                            <div className="text-center p-8 bg-slate-800 rounded-xl border border-slate-700">
                                <svg className="w-16 h-16 mx-auto text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                                <h2 className="text-2xl font-bold text-slate-100 mb-2">Certificate Locked</h2>
                                <p className="text-slate-400">
                                    Reach Level {certificateRequirements.level} and solve {certificateRequirements.puzzles} puzzles to earn your official certificate.
                                </p>
                                <p className="text-slate-500 mt-4 text-sm">
                                    Current progress: Level {user.level} / Puzzles: {user.solvedPuzzleIds.length}
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {isQualified && nameSubmitted && (
                        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-4 print:hidden">
                            <button 
                                onClick={printCertificate}
                                disabled={isGeneratingPdf}
                                className="px-6 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center gap-2 text-sm uppercase tracking-wide"
                            >
                                {isGeneratingPdf ? (
                                     <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                )}
                                Save as PDF
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CertificateModal;
