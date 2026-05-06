import React from 'react';
import { useAppContext } from '../context/AppContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
    const { state } = useAppContext();

    return (
        <div className="fixed bottom-5 right-5 z-[100] space-y-3">
            {state.toasts.map(toast => (
                <Toast key={toast.id} id={toast.id} message={toast.message} type={toast.type} />
            ))}
        </div>
    );
};

export default ToastContainer;
