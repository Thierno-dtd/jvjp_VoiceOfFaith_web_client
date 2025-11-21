import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../config/api';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            loading: false,
            error: null,
            isAuthenticated: false,

            // Login
            login: async (email, password) => {
                set({ loading: true, error: null });
                try {
                    // Authentification Firebase
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    const idToken = await userCredential.user.getIdToken();

                    // Appeler l'API pour obtenir les données complètes
                    const response = await api.post('/auth/login', {
                        email,
                        password
                    });

                    const userData = response.data.user;

                    // Vérifier les rôles autorisés
                    const allowedRoles = ['admin', 'pasteur', 'media'];
                    if (!allowedRoles.includes(userData.role)) {
                        await firebaseSignOut(auth);
                        throw new Error('Accès non autorisé. Seuls les administrateurs, pasteurs et équipe média peuvent se connecter.');
                    }

                    set({
                        user: userData,
                        isAuthenticated: true,
                        loading: false,
                        error: null
                    });

                    return userData;
                } catch (error) {
                    const errorMessage = error.message || 'Erreur de connexion';
                    set({
                        loading: false,
                        error: errorMessage,
                        isAuthenticated: false,
                        user: null
                    });
                    throw error;
                }
            },

            // Logout
            logout: async () => {
                set({ loading: true });
                try {
                    await api.post('/auth/logout');
                    await firebaseSignOut(auth);

                    set({
                        user: null,
                        isAuthenticated: false,
                        loading: false,
                        error: null
                    });
                } catch (error) {
                    console.error('Logout error:', error);
                    // Force logout même en cas d'erreur
                    set({
                        user: null,
                        isAuthenticated: false,
                        loading: false,
                        error: null
                    });
                }
            },

            // Vérifier l'authentification au chargement
            checkAuth: async () => {
                const currentUser = auth.currentUser;
                if (!currentUser) {
                    set({ user: null, isAuthenticated: false, loading: false });
                    return;
                }

                set({ loading: true });
                try {
                    const response = await api.get('/auth/me');
                    const userData = response.data.user;

                    // Vérifier les rôles autorisés
                    const allowedRoles = ['admin', 'pasteur', 'media'];
                    if (!allowedRoles.includes(userData.role)) {
                        await firebaseSignOut(auth);
                        throw new Error('Accès non autorisé');
                    }

                    set({
                        user: userData,
                        isAuthenticated: true,
                        loading: false
                    });
                } catch (error) {
                    console.error('Check auth error:', error);
                    await firebaseSignOut(auth);
                    set({
                        user: null,
                        isAuthenticated: false,
                        loading: false
                    });
                }
            },

            // Clear error
            clearError: () => set({ error: null }),

            // Update user data
            updateUser: (userData) => set({ user: userData }),

            // Check permissions
            hasPermission: (requiredRole) => {
                const { user } = get();
                if (!user) return false;

                const roleHierarchy = {
                    admin: 3,
                    pasteur: 2,
                    media: 1
                };

                const userLevel = roleHierarchy[user.role] || 0;
                const requiredLevel = roleHierarchy[requiredRole] || 0;

                return userLevel >= requiredLevel;
            },

            // Check if user is admin
            isAdmin: () => {
                const { user } = get();
                return user?.role === 'admin';
            },

            // Check if user is moderator (pasteur or media)
            isModerator: () => {
                const { user } = get();
                return ['admin', 'pasteur', 'media'].includes(user?.role);
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);

export default useAuthStore;