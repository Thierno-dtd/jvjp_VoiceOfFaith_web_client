import React, { useState, useEffect } from 'react';
import { Radio, Send, Youtube, AlertCircle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { liveService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const liveSchema = z.object({
    liveTitle: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
    liveYoutubeUrl: z.string().url('URL YouTube invalide')
});

const notificationSchema = z.object({
    title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
    body: z.string().min(10, 'Le message doit contenir au moins 10 caractères')
});

const LivePage = () => {
    const [liveStatus, setLiveStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [sending, setSending] = useState(false);

    const {
        register: registerLive,
        handleSubmit: handleSubmitLive,
        formState: { errors: liveErrors },
        reset: resetLive
    } = useForm({
        resolver: zodResolver(liveSchema)
    });

    const {
        register: registerNotif,
        handleSubmit: handleSubmitNotif,
        formState: { errors: notifErrors },
        reset: resetNotif
    } = useForm({
        resolver: zodResolver(notificationSchema),
        defaultValues: {
            title: '🔴 LIVE EN DIRECT !',
            body: 'Rejoignez-nous maintenant pour le culte en direct'
        }
    });

    useEffect(() => {
        fetchLiveStatus();
    }, []);

    const fetchLiveStatus = async () => {
        try {
            const response = await liveService.getStatus();
            setLiveStatus(response.data.live);

            if (response.data.live.isLive) {
                resetLive({
                    liveTitle: response.data.live.liveTitle || '',
                    liveYoutubeUrl: response.data.live.liveYoutubeUrl || ''
                });
            }
        } catch (error) {
            toast.error('Erreur lors du chargement du statut');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartLive = async (data) => {
        try {
            setUpdating(true);
            await liveService.updateStatus({
                isLive: true,
                liveTitle: data.liveTitle,
                liveYoutubeUrl: data.liveYoutubeUrl
            });
            toast.success('LIVE démarré avec succès !');
            fetchLiveStatus();
        } catch (error) {
            toast.error('Erreur lors du démarrage du LIVE');
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    const handleStopLive = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir arrêter le LIVE ?')) return;

        try {
            setUpdating(true);
            await liveService.updateStatus({
                isLive: false,
                liveTitle: null,
                liveYoutubeUrl: null
            });
            toast.success('LIVE arrêté');
            resetLive();
            fetchLiveStatus();
        } catch (error) {
            toast.error('Erreur lors de l\'arrêt du LIVE');
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    const handleSendNotification = async (data) => {
        if (!liveStatus?.isLive) {
            toast.error('Le LIVE doit être actif pour envoyer une notification');
            return;
        }

        try {
            setSending(true);
            await liveService.sendNotification(data);
            toast.success('Notification envoyée avec succès !');
            resetNotif();
        } catch (error) {
            toast.error('Erreur lors de l\'envoi de la notification');
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion du LIVE</h1>
                <p className="text-gray-600 mt-1">
                    Contrôlez les diffusions en direct sur YouTube
                </p>
            </div>

            {/* Status Card */}
            <div className={`card ${liveStatus?.isLive ? 'border-2 border-red-500' : ''}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            liveStatus?.isLive ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                            <Radio className={`w-8 h-8 ${
                                liveStatus?.isLive ? 'text-red-600 animate-pulse' : 'text-gray-400'
                            }`} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {liveStatus?.isLive ? 'LIVE EN COURS' : 'HORS LIGNE'}
                            </h2>
                            <p className="text-gray-600">
                                {liveStatus?.isLive
                                    ? 'Le LIVE est actuellement diffusé'
                                    : 'Aucun LIVE en cours'}
                            </p>
                        </div>
                    </div>

                    {liveStatus?.isLive ? (
                        <span className="badge badge-danger text-base px-4 py-2">
                            🔴 EN DIRECT
                        </span>
                    ) : (
                        <span className="badge bg-gray-100 text-gray-800 text-base px-4 py-2">
                            ⚫ Hors ligne
                        </span>
                    )}
                </div>

                {liveStatus?.isLive && (
                    <div className="p-4 bg-red-50 rounded-lg mb-6">
                        <h3 className="font-semibold text-red-900 mb-2">{liveStatus.liveTitle}</h3>
                        <a
                            href={liveStatus.liveYoutubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-red-600 hover:underline flex items-center gap-2"
                        >
                            <Youtube className="w-4 h-4" />
                            {liveStatus.liveYoutubeUrl}
                        </a>
                    </div>
                )}

                {/* Live Control Form */}
                {!liveStatus?.isLive ? (
                    <form onSubmit={handleSubmitLive(handleStartLive)} className="space-y-4">
                        <div>
                            <label className="label">Titre du LIVE *</label>
                            <input
                                {...registerLive('liveTitle')}
                                className={`input ${liveErrors.liveTitle ? 'input-error' : ''}`}
                                placeholder="Culte du dimanche matin"
                            />
                            {liveErrors.liveTitle && (
                                <p className="text-red-500 text-sm mt-1">{liveErrors.liveTitle.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">
                                <Youtube className="w-4 h-4 inline mr-2" />
                                URL YouTube du LIVE *
                            </label>
                            <input
                                {...registerLive('liveYoutubeUrl')}
                                className={`input ${liveErrors.liveYoutubeUrl ? 'input-error' : ''}`}
                                placeholder="https://youtube.com/live/xxxxx"
                            />
                            {liveErrors.liveYoutubeUrl && (
                                <p className="text-red-500 text-sm mt-1">{liveErrors.liveYoutubeUrl.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={updating}
                            className="btn-primary w-full h-12 text-lg"
                        >
                            {updating ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Démarrage...
                                </>
                            ) : (
                                <>
                                    <Radio className="w-5 h-5 mr-2" />
                                    Démarrer le LIVE
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <button
                        onClick={handleStopLive}
                        disabled={updating}
                        className="btn-danger w-full h-12 text-lg"
                    >
                        {updating ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Arrêt...
                            </>
                        ) : (
                            'Arrêter le LIVE'
                        )}
                    </button>
                )}
            </div>

            {/* Notification Card */}
            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Send className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Notification Push</h2>
                        <p className="text-sm text-gray-600">
                            Envoyez une notification à tous les utilisateurs
                        </p>
                    </div>
                </div>

                {!liveStatus?.isLive && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                            <p className="font-medium">Le LIVE doit être actif</p>
                            <p>Démarrez un LIVE avant d'envoyer une notification</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmitNotif(handleSendNotification)} className="space-y-4">
                    <div>
                        <label className="label">Titre de la notification *</label>
                        <input
                            {...registerNotif('title')}
                            className={`input ${notifErrors.title ? 'input-error' : ''}`}
                            placeholder="🔴 LIVE EN DIRECT !"
                            disabled={!liveStatus?.isLive}
                        />
                        {notifErrors.title && (
                            <p className="text-red-500 text-sm mt-1">{notifErrors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="label">Message *</label>
                        <textarea
                            {...registerNotif('body')}
                            rows={4}
                            className={`input ${notifErrors.body ? 'input-error' : ''}`}
                            placeholder="Rejoignez-nous maintenant pour le culte en direct"
                            disabled={!liveStatus?.isLive}
                        />
                        {notifErrors.body && (
                            <p className="text-red-500 text-sm mt-1">{notifErrors.body.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={sending || !liveStatus?.isLive}
                        className="btn-primary w-full"
                    >
                        {sending ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Envoi en cours...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5 mr-2" />
                                Envoyer la notification
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Info Card */}
            <div className="card bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">Comment ça marche ?</p>
                        <ul className="space-y-1 list-disc list-inside">
                            <li>Créez un LIVE sur YouTube et copiez l'URL</li>
                            <li>Démarrez le LIVE depuis cette interface</li>
                            <li>Les utilisateurs verront le LIVE dans l'application</li>
                            <li>Envoyez une notification pour alerter les utilisateurs</li>
                            <li>Arrêtez le LIVE une fois terminé</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivePage;