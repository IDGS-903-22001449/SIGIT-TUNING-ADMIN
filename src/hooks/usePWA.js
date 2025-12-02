// Hook para manejar actualizaciones de PWA
import { useEffect, useState } from 'react';

export const usePWA = () => {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [registration, setRegistration] = useState(null);

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        navigator.serviceWorker.ready.then((reg) => {
            setRegistration(reg);

            // Escuchar cambios
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Nueva versión disponible
                        setUpdateAvailable(true);
                    }
                });
            });
        });

        // Escuchar mensajes del service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'SKIP_WAITING') {
                window.location.reload();
            }
        });
    }, []);

    const updateApp = () => {
        if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            setUpdateAvailable(false);
        }
    };

    return { updateAvailable, updateApp };
};

export default usePWA;
