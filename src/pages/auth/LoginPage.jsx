import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
});

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, loading } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data) => {
        try {
            await login(data.email, data.password);
            toast.success('Connexion réussie !');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message || 'Erreur de connexion');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat p-12 flex-col justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Voice of Faith
                    </h1>
                    <p className="text-primary-100 text-lg">
                        Plateforme d'administration
                    </p>
                </div>




            </div>

            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-primary-100 rounded-full mb-4">
                            <LogIn className="w-8 h-8 text-primary-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Connexion
                        </h2>
                        <p className="text-gray-600">
                            Accédez à votre espace d'administration
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="label">
                                <Mail className="w-4 h-4 inline mr-2" />
                                Adresse email
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                className={`input ${errors.email ? 'input-error' : ''}`}
                                placeholder="votre.email@example.com"
                                disabled={loading}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="label">
                                <Lock className="w-4 h-4 inline mr-2" />
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    className={`input ${errors.password ? 'input-error' : ''}`}
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={loading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full h-12 text-base ml-4"
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Connexion en cours...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Se connecter
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Réservé aux administrateurs, pasteurs et équipe média
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;