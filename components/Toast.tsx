import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

interface ToastProps {
    id: number;
    message: string;
    type: 'success' | 'error';
    duration?: number;
}

const icons = {
    success: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    error: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};


const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 4000 }) => {
    const { dispatch } = useAppContext();

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch({ type: 'REMOVE_TOAST', payload: id });
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, dispatch]);
    
    const handleClose = () => {
        dispatch({ type: 'REMOVE_TOAST', payload: id });
    };

    const bgColor = type === 'success' ? 'bg-green-600/90 border-green-500' : 'bg-red-600/90 border-red-500';

    return (
         <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={`flex items-start justify-between w-full max-w-sm p-4 text-white ${bgColor} rounded-xl shadow-2xl border backdrop-blur-md`} 
            role="alert"
        >
            <div className="flex items-center">
                <div className="flex-shrink-0">{icons[type]}</div>
                <div className="ml-3 text-sm font-medium">{message}</div>
            </div>
            <button onClick={handleClose} type="button" className="ml-4 -mr-2 -my-2 p-1.5 text-white/70 hover:text-white rounded-lg focus:ring-2 focus:ring-gray-300 inline-flex h-8 w-8" aria-label="Close">
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </button>
        </motion.div>
    );
};

export default Toast;