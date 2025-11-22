import React, { useState } from 'react';
import { X, Mail, User, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { userService } from '../../services';
import LoadingSpinner from '../common/LoadingSpinner';

const inviteSchema = z.object({
    email: z.string().email('Email invalide'),
    displayName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    role: z.enum(['pasteur', 'media'])
});

const InviteUserModal = ({ onClose }) => {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(inviteSchema),
        defaultValues: {
            role: 'media'
        }
    });

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            await userService.inviteUser(data);
            toast.success('Invitation envoyée avec succès !');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Inviter un utilisateur
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <Mail className="w-4 h-4 inline mr-1" />
                            Un email d'invitation sera envoyé à l'utilisateur avec un lien pour créer son mot de passe.
                        </p>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="label">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Adresse email *
                        </label>
                        <input
                            {...register('email')}
                            type="email"
                            className={`input ${errors.email ? 'input-error' : ''}`}
                            placeholder="nom@exemple.com"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Display Name */}
                    <div>
                        <label className="label">
                            <User className="w-4 h-4 inline mr-2" />
                            Nom complet *
                        </label>
                        <input
                            {...register('displayName')}
                            type="text"
                            className={`input ${errors.displayName ? 'input-error' : ''}`}
                            placeholder="Jean Dupont"
                        />
                        {errors.displayName && (
                            <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>
                        )}
                    </div>

                    {/* Role */}
                    <div>
                        <label className="label">
                            <Shield className="w-4 h-4 inline mr-2" />
                            Rôle *
                        </label>
                        <select {...register('role')} className="input">
                            <option value="media">Équipe média</option>
                            <option value="pasteur">Pasteur</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                            <strong>Pasteur :</strong> Peut créer et gérer tous les contenus
                            <br />
                            <strong>Média :</strong> Peut créer et gérer tous les contenus
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Envoi...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-5 h-5 mr-2" />
                                    Envoyer l'invitation
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteUserModal;