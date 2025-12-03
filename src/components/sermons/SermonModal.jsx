import React, { useState } from 'react';
import { X, Upload, BookOpen, Image as ImageIcon, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { sermonService } from '../../services';
import LoadingSpinner from '../common/LoadingSpinner';
import useThemeStore from '../../store/themeStore';

const sermonSchema = z.object({
    title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
    date: z.string().min(1, 'La date est requise')
});

const SermonModal = ({ sermon, onClose }) => {
    const { theme } = useThemeStore();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(sermon?.imageUrl || null);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(sermonSchema),
        defaultValues: {
            title: sermon?.title || '',
            date: sermon?.date ? new Date(sermon.date).toISOString().split('T')[0] : ''
        }
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('L\'image ne doit pas dépasser 10 MB');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                toast.error('Le PDF ne doit pas dépasser 50 MB');
                return;
            }
            if (file.type !== 'application/pdf') {
                toast.error('Seuls les fichiers PDF sont acceptés');
                return;
            }
            setPdfFile(file);
        }
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);

            if (!sermon && (!imageFile || !pdfFile)) {
                toast.error('Veuillez sélectionner une image et un fichier PDF');
                return;
            }

            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('date', data.date);

            if (imageFile) {
                formData.append('image', imageFile);
            }
            if (pdfFile) {
                formData.append('pdf', pdfFile);
            }

            if (sermon) {
                // Update
                await sermonService.updateSermon(sermon.id, {
                    title: data.title,
                    date: data.date
                });
                toast.success('Sermon modifié avec succès');
            } else {
                // Create
                await sermonService.createSermon(formData);
                toast.success('Sermon ajouté avec succès');
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
                        {sermon ? 'Modifier le sermon' : 'Nouveau sermon'}
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
                            placeholder="Titre du sermon"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Date */}
                    <div>
                        <label className="label">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Date *
                        </label>
                        <input
                            {...register('date')}
                            type="date"
                            className={`input ${errors.date ? 'input-error' : ''}`}
                        />
                        {errors.date && (
                            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                        )}
                    </div>

                    {/* Image */}
                    <div>
                        <label className="label">
                            Image * {sermon && '(laisser vide pour ne pas modifier)'}
                        </label>
                        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            theme === 'dark'
                                ? 'border-gray-600 bg-gray-900 hover:border-primary-500'
                                : 'border-gray-300 hover:border-primary-500'
                        }`}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="cursor-pointer flex flex-col items-center"
                            >
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Aperçu"
                                        className="w-full max-h-48 object-contain rounded-lg mb-2"
                                    />
                                ) : (
                                    <ImageIcon className={`w-12 h-12 mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                                )}
                                <span className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {imageFile ? imageFile.name : 'Cliquez pour sélectionner une image'}
                                </span>
                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                    JPG, PNG - Max 10 MB
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* PDF */}
                    <div>
                        <label className="label">
                            Fichier PDF * {sermon && '(laisser vide pour ne pas modifier)'}
                        </label>
                        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            theme === 'dark'
                                ? 'border-gray-600 bg-gray-900 hover:border-primary-500'
                                : 'border-gray-300 hover:border-primary-500'
                        }`}>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handlePdfChange}
                                className="hidden"
                                id="pdf-upload"
                            />
                            <label
                                htmlFor="pdf-upload"
                                className="cursor-pointer flex flex-col items-center"
                            >
                                <BookOpen className={`w-12 h-12 mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                                <span className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {pdfFile ? pdfFile.name : 'Cliquez pour sélectionner un PDF'}
                                </span>
                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                    PDF - Max 50 MB
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
                                    {sermon ? 'Modification...' : 'Ajout...'}
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5 mr-2" />
                                    {sermon ? 'Modifier' : 'Ajouter'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SermonModal;