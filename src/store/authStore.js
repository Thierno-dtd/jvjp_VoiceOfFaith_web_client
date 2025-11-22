import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../config/api';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            loading: false,
            isAuthenticated: false,

            // Login simple via backend
            login: async (email, password) => {
                set({ loading: true, error: null });
                try {
                    // ✅ Le backend gère tout
                    const response = await api.post('/auth/login', {
                        email,
                        password
                    });

                    const { token, user } = response.data;

                    // Stocker le token pour les prochains appels
                    localStorage.setItem('token', token);

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        loading: false
                    });

                    return user;
                } catch (error) {
                    set({
                        loading: false,
                        error: error.response?.data?.message || 'Erreur de connexion',
                        isAuthenticated: false,
                        user: null
                    });
                    throw error;
                }
            },

            // Logout simple
            logout: async () => {
                try {
                    await api.post('/auth/logout');
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    localStorage.removeItem('token');
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false
                    });
                }
            },

            // Vérification au chargement
            checkAuth: async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    set({ loading: false, isAuthenticated: false });
                    return;
                }

                set({ loading: true });
                try {
                    const response = await api.get('/auth/me');
                    set({
                        user: response.data.user,
                        token,
                        isAuthenticated: true,
                        loading: false
                    });
                } catch (error) {
                    localStorage.removeItem('token');
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        loading: false
                    });
                }
            },

            resendVerificationEmail: async (email) => {
                try {
                    await api.post('/auth/resend-verification', { email });
                    return true;
                } catch (error) {
                    throw error;
                }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);

export default useAuthStore;