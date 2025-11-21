import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600`} />
        </div>
    );
};

export const LoadingPage = ({ message = 'Chargement...' }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <LoadingSpinner size="xl" />
            <p className="mt-4 text-gray-600 font-medium">{message}</p>
        </div>
    );
};

export const LoadingOverlay = ({ message = 'Chargement...' }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 flex flex-col items-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-700 font-medium">{message}</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;