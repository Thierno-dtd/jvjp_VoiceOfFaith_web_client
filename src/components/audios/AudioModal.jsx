import React, { useState } from 'react';
import { X, Upload, Music, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { audioService } from '../../services';
import LoadingSpinner from '../common/LoadingSpinner';
import useThemeStore from '../../store/themeStore';

const audioSchema = z.object({
    title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
    description: z.string().optional(),
    category: z.enum(['emission', 'podcast', 'teaching'])
});

const AudioModal = ({ audio, onClose }) => {
    const { theme } = useThemeStore();
    const [loading, setLoading] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [audioPreview, setAudioPreview] = useState(audio?.audioUrl || null);
    const [thumbnailPreview, setThumbnailPreview] = useState(audio?.thumbnailUrl || null);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(audioSchema),
        defaultValues: {
            title: audio?.title || '',
            description: audio?.description || '',
            category: audio?.category || 'teaching'
        }
    });

    const handleAudioChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) {
                toast.error('Le fichier audio ne doit pas dépasser 100 MB');
                return;
            }
            setAudioFile(file);
            setAudioPreview(URL.createObjectURL(file));
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('La miniature ne doit pas dépasser 10 MB');
                return;
            }
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);

            if (!audio && !audioFile) {
                toast.error('Veuillez sélectionner un fichier audio');
                return;
            }

            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('category', data.category);
            if (data.description) {
                formData.append('description', data.description);
            }

            if (audioFile) {
                formData.append('audio', audioFile);
            }
            if (thumbnailFile) {
                formData.append('thumbnail', thumbnailFile);
            }

            if (audio) {
                // Update
                await audioService.updateAudio(audio.id, {
                    title: data.title,
                    description: data.description
                });
                toast.success('Audio modifié avec succès');
            } else {
                // Create
                await audioService.createAudio(formData);
                toast.success('Audio ajouté avec succès');
            }

            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-black/80' : 'bg-black/50'} flex items-center justify-center z-50 p-4`}>
            <div className={`${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-6 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                    <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {audio ? 'Modifier l\'audio' : 'Nouvel audio'}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                        <X className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="label">Titre *</label>
                        <input
                            {...register('title')}
                            className={`input ${errors.title ? 'input-error' : ''}`}
                            placeholder="Titre de l'audio"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="label">Description</label>
                        <textarea
                            {...register('description')}
                            rows={4}
                            className={`input ${errors.description ? 'input-error' : ''}`}
                            placeholder="Description de l'audio (optionnel)"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="label">Catégorie *</label>
                        <select {...register('category')} className="input">
                            <option value="emission">Émission</option>
                            <option value="podcast">Podcast</option>
                            <option value="teaching">Enseignement</option>
                        </select>
                    </div>

                    {/* Audio file */}
                    <div>
                        <label className="label">
                            Fichier audio * {audio && '(laisser vide pour ne pas modifier)'}
                        </label>
                        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            theme === 'dark'
                                ? 'border-gray-600 bg-gray-900 hover:border-primary-500'
                                : 'border-gray-300 hover:border-primary-500'
                        }`}>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={handleAudioChange}
                                className="hidden"
                                id="audio-upload"
                            />
                            <label
                                htmlFor="audio-upload"
                                className="cursor-pointer flex flex-col items-center"
                            >
                                <Music className={`w-12 h-12 mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                                <span className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {audioFile ? audioFile.name : 'Cliquez pour sélectionner un fichier audio'}
                                </span>
                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                    MP3, WAV, M4A - Max 100 MB
                                </span>
                            </label>
                        </div>
                        {audioPreview && (
                            <audio controls className="w-full mt-4">
                                <source src={audioPreview} type="audio/mpeg" />
                            </audio>
                        )}
                    </div>

                    {/* Thumbnail */}
                    <div>
                        <label className="label">Miniature (optionnel)</label>
                        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            theme === 'dark'
                                ? 'border-gray-600 bg-gray-900 hover:border-primary-500'
                                : 'border-gray-300 hover:border-primary-500'
                        }`}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                className="hidden"
                                id="thumbnail-upload"
                            />
                            <label
                                htmlFor="thumbnail-upload"
                                className="cursor-pointer flex flex-col items-center"
                            >
                                {thumbnailPreview ? (
                                    <img
                                        src={thumbnailPreview}
                                        alt="Aperçu"
                                        className="w-32 h-32 object-cover rounded-lg mb-2"
                                    />
                                ) : (
                                    <ImageIcon className={`w-12 h-12 mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                                )}
                                <span className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {thumbnailFile ? thumbnailFile.name : 'Cliquez pour sélectionner une image'}
                                </span>
                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                    JPG, PNG - Max 10 MB
                                </span>
                            </label>
                        </div>
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
                                    {audio ? 'Modification...' : 'Ajout...'}
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5 mr-2" />
                                    {audio ? 'Modifier' : 'Ajouter'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AudioModal;