import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Fonction pour détecter le thème système
const getSystemTheme = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
};

// Fonction pour appliquer le thème au DOM
const applyTheme = (theme) => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
    }
};

const useThemeStore = create(
    persist(
        (set, get) => ({
            // Utiliser le thème système par défaut
            theme: typeof window !== 'undefined' ? getSystemTheme() : 'light',
            isSystemTheme: true, // Indique si on utilise le thème système

            toggleTheme: () => set((state) => {
                const newTheme = state.theme === 'light' ? 'dark' : 'light';
                applyTheme(newTheme);
                return {
                    theme: newTheme,
                    isSystemTheme: false // On n'utilise plus le thème système
                };
            }),

            setTheme: (theme) => set(() => {
                applyTheme(theme);
                return {
                    theme,
                    isSystemTheme: false
                };
            }),

            // Nouvelle méthode pour utiliser le thème système
            useSystemTheme: () => set(() => {
                const systemTheme = getSystemTheme();
                applyTheme(systemTheme);
                return {
                    theme: systemTheme,
                    isSystemTheme: true
                };
            }),

            // Initialiser le thème au chargement
            initTheme: () => {
                const state = get();
                if (state.isSystemTheme) {
                    const systemTheme = getSystemTheme();
                    applyTheme(systemTheme);
                    set({ theme: systemTheme });
                } else {
                    applyTheme(state.theme);
                }
            }
        }),
        {
            name: 'theme-storage',
            // Ne persister que le thème choisi manuellement
            partialize: (state) => ({
                theme: state.theme,
                isSystemTheme: state.isSystemTheme
            })
        }
    )
);

// Écouter les changements du thème système
if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const store = useThemeStore.getState();
        // Ne changer que si on utilise le thème système
        if (store.isSystemTheme) {
            const newTheme = e.matches ? 'dark' : 'light';
            store.setTheme(newTheme);
        }
    });
}

export default useThemeStore;