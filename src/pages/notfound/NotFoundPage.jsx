import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center">
                {/* 404 Illustration */}
                <div className="mb-8">
                    <div className="inline-block">
                        <svg
                            className="w-64 h-64"
                            viewBox="0 0 400 300"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Background circle */}
                            <circle cx="200" cy="150" r="120" fill="#EEF2FF" />

                            {/* 404 Text */}
                            <text
                                x="200"
                                y="180"
                                fontSize="80"
                                fontWeight="bold"
                                fill="#4F46E5"
                                textAnchor="middle"
                            >
                                404
                            </text>

                            {/* Sad face */}
                            <circle cx="170" cy="120" r="8" fill="#4F46E5" />
                            <circle cx="230" cy="120" r="8" fill="#4F46E5" />
                            <path
                                d="M 160 160 Q 200 140 240 160"
                                stroke="#4F46E5"
                                strokeWidth="6"
                                strokeLinecap="round"
                                fill="none"
                            />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Page introuvable
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-secondary inline-flex items-center justify-center"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Retour
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn-primary inline-flex items-center justify-center"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Accueil
                    </button>
                </div>

                {/* Additional Links */}
                <div className="mt-12">
                    <p className="text-sm text-gray-500 mb-4">
                        Pages rapides :
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <button
                            onClick={() => navigate('/audios')}
                            className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                        >
                            Audios
                        </button>
                        <span className="text-gray-300">•</span>
                        <button
                            onClick={() => navigate('/sermons')}
                            className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                        >
                            Sermons
                        </button>
                        <span className="text-gray-300">•</span>
                        <button
                            onClick={() => navigate('/events')}
                            className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                        >
                            Événements
                        </button>
                        <span className="text-gray-300">•</span>
                        <button
                            onClick={() => navigate('/posts')}
                            className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                        >
                            Publications
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;