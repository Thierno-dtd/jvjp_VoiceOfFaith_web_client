import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Video } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { postService } from '../../services';
import LoadingSpinner from '../common/LoadingSpinner';

const postSchema = z.object({
    content: z.string().min(10, 'Le contenu doit contenir au moins 10 caractères'),
    type: z.enum(['image', 'video']),
    category: z.enum(['pensee', 'pasteur', 'media'])
});

const PostModal = ({ post, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(post?.mediaUrl || null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(postSchema),
        defaultValues: {
            content: post?.content || '',
            type: post?.type || 'image',
            category: post?.category || 'pensee'
        }
    });

    const selectedType = watch('type');

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSize = selectedType === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error(`Le fichier ne doit pas dépasser ${selectedType === 'video' ? '100' : '10'} MB`);
                return;
            }

            const validTypes = selectedType === 'video'
                ? ['video/mp4', 'video/quicktime', 'video/x-msvideo']
                : ['image/jpeg', 'image/png', 'image/webp'];

            if (!validTypes.includes(file.type)) {
                toast.error(`Type de fichier invalide. ${selectedType === 'video' ? 'Utilisez MP4, MOV ou AVI' : 'Utilisez JPG, PNG ou WEBP'}`);
                return;
            }

            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);

            if (!post && !mediaFile) {
                toast.error('Veuillez sélectionner un fichier média');
                return;
            }

            const formData = new FormData();
            formData.append('content', data.content);
            formData.append('type', data.type);
            formData.append('category', data.category);

            if (mediaFile) {
                formData.append('media', mediaFile);
            }

            if (post) {
                // Update only content (media cannot be changed)
                await postService.updatePost(post.id, {
                    content: data.content
                });
                toast.success('Publication modifiée avec succès');
            } else {
                // Create
                await postService.createPost(formData);
                toast.success('Publication créée avec succès');
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
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {post ? 'Modifier la publication' : 'Nouvelle publication'}
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
                    {/* Type */}
                    <div>
                        <label className="label">Type de contenu *</label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedType === 'image'
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <input
                                    {...register('type')}
                                    type="radio"
                                    value="image"
                                    className="hidden"
                                    disabled={!!post}
                                />
                                <ImageIcon className="w-6 h-6 mr-2" />
                                <span className="font-medium">Image</span>
                            </label>
                            <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedType === 'video'
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <input
                                    {...register('type')}
                                    type="radio"
                                    value="video"
                                    className="hidden"
                                    disabled={!!post}
                                />
                                <Video className="w-6 h-6 mr-2" />
                                <span className="font-medium">Vidéo</span>
                            </label>
                        </div>
                        {post && (
                            <p className="text-xs text-gray-500 mt-2">
                                Le type de contenu ne peut pas être modifié
                            </p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="label">Catégorie *</label>
                        <select {...register('category')} className="input">
                            <option value="pensee">Pensée du jour</option>
                            <option value="pasteur">Pasteur</option>
                            <option value="media">Média</option>
                        </select>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="label">Contenu *</label>
                        <textarea
                            {...register('content')}
                            rows={6}
                            className={`input ${errors.content ? 'input-error' : ''}`}
                            placeholder="Écrivez votre message..."
                        />
                        {errors.content && (
                            <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                        )}
                    </div>

                    {/* Media Upload */}
                    <div>
                        <label className="label">
                            {selectedType === 'video' ? 'Fichier vidéo' : 'Image'} *
                            {post && ' (ne peut pas être modifié)'}
                        </label>
                        {!post && (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                                <input
                                    type="file"
                                    accept={selectedType === 'video' ? 'video/*' : 'image/*'}
                                    onChange={handleMediaChange}
                                    className="hidden"
                                    id="media-upload"
                                />
                                <label
                                    htmlFor="media-upload"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    {mediaPreview ? (
                                        selectedType === 'video' ? (
                                            <video
                                                src={mediaPreview}
                                                className="w-full max-h-64 rounded-lg mb-2"
                                                controls
                                            />
                                        ) : (
                                            <img
                                                src={mediaPreview}
                                                alt="Aperçu"
                                                className="w-full max-h-64 object-contain rounded-lg mb-2"
                                            />
                                        )
                                    ) : (
                                        <>
                                            {selectedType === 'video' ? (
                                                <Video className="w-12 h-12 text-gray-400 mb-2" />
                                            ) : (
                                                <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                                            )}
                                        </>
                                    )}
                                    <span className="text-sm text-gray-600 mb-1">
                                        {mediaFile ? mediaFile.name : 'Cliquez pour sélectionner un fichier'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {selectedType === 'video'
                                            ? 'MP4, MOV, AVI - Max 100 MB'
                                            : 'JPG, PNG, WEBP - Max 10 MB'}
                                    </span>
                                </label>
                            </div>
                        )}
                        {post && (
                            <div className="border rounded-lg p-4 bg-gray-50">
                                {post.type === 'video' ? (
                                    <video
                                        src={post.mediaUrl}
                                        poster={post.thumbnailUrl}
                                        className="w-full rounded-lg"
                                        controls
                                    />
                                ) : (
                                    <img
                                        src={post.mediaUrl}
                                        alt="Current"
                                        className="w-full rounded-lg"
                                    />
                                )}
                            </div>
                        )}
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
                                    {post ? 'Modification...' : 'Publication...'}
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5 mr-2" />
                                    {post ? 'Modifier' : 'Publier'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostModal;