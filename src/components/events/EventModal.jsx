import React, { useState } from 'react';
import { X, Upload, Calendar, MapPin, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { eventService } from '../../services';
import LoadingSpinner from '../common/LoadingSpinner';

const eventSchema = z.object({
    title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
    description: z.string().optional(),
    startDate: z.string().min(1, 'La date de début est requise'),
    endDate: z.string().optional(),
    location: z.string().optional()
});

const EventModal = ({ event, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(event?.imageUrl || null);
    const [dailySummaries, setDailySummaries] = useState(event?.dailySummaries || []);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: event?.title || '',
            description: event?.description || '',
            startDate: event?.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
            endDate: event?.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
            location: event?.location || ''
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

    const addDailySummary = () => {
        setDailySummaries([...dailySummaries, { date: '', summary: '' }]);
    };

    const removeDailySummary = (index) => {
        setDailySummaries(dailySummaries.filter((_, i) => i !== index));
    };

    const updateDailySummary = (index, field, value) => {
        const updated = [...dailySummaries];
        updated[index][field] = value;
        setDailySummaries(updated);
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('startDate', data.startDate);

            if (data.description) formData.append('description', data.description);
            if (data.endDate) formData.append('endDate', data.endDate);
            if (data.location) formData.append('location', data.location);

            if (dailySummaries.length > 0) {
                formData.append('dailySummaries', JSON.stringify(dailySummaries.filter(ds => ds.date && ds.summary)));
            }

            if (imageFile) {
                formData.append('image', imageFile);
            }

            if (event) {
                await eventService.updateEvent(event.id, formData);
                toast.success('Événement modifié avec succès');
            } else {
                await eventService.createEvent(formData);
                toast.success('Événement créé avec succès');
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {event ? 'Modifier l\'événement' : 'Nouvel événement'}
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
                    {/* Title */}
                    <div>
                        <label className="label">Titre *</label>
                        <input
                            {...register('title')}
                            className={`input ${errors.title ? 'input-error' : ''}`}
                            placeholder="Titre de l'événement"
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
                            className="input"
                            placeholder="Description de l'événement"
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">
                                <Calendar className="w-4 h-4 inline mr-2" />
                                Date de début *
                            </label>
                            <input
                                {...register('startDate')}
                                type="date"
                                className={`input ${errors.startDate ? 'input-error' : ''}`}
                            />
                            {errors.startDate && (
                                <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">
                                <Calendar className="w-4 h-4 inline mr-2" />
                                Date de fin
                            </label>
                            <input
                                {...register('endDate')}
                                type="date"
                                className="input"
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="label">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            Lieu
                        </label>
                        <input
                            {...register('location')}
                            className="input"
                            placeholder="Lieu de l'événement"
                        />
                    </div>

                    {/* Image */}
                    <div>
                        <label className="label">Image de couverture</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
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
                                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                                )}
                                <span className="text-sm text-gray-600 mb-1">
                                    {imageFile ? imageFile.name : 'Cliquez pour sélectionner une image'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    JPG, PNG - Max 10 MB
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Daily Summaries */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="label mb-0">Résumés quotidiens</label>
                            <button
                                type="button"
                                onClick={addDailySummary}
                                className="btn-ghost text-sm"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Ajouter un résumé
                            </button>
                        </div>

                        <div className="space-y-4">
                            {dailySummaries.map((summary, index) => (
                                <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-1 space-y-3">
                                        <input
                                            type="date"
                                            value={summary.date}
                                            onChange={(e) => updateDailySummary(index, 'date', e.target.value)}
                                            className="input"
                                            placeholder="Date"
                                        />
                                        <textarea
                                            value={summary.summary}
                                            onChange={(e) => updateDailySummary(index, 'summary', e.target.value)}
                                            rows={3}
                                            className="input"
                                            placeholder="Résumé de la journée"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeDailySummary(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}

                            {dailySummaries.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    Aucun résumé quotidien. Cliquez sur "Ajouter un résumé" pour commencer.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 border-t">
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
                                    {event ? 'Modification...' : 'Création...'}
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5 mr-2" />
                                    {event ? 'Modifier' : 'Créer'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventModal;