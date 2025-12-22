'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function SuspensionListener() {
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch('/api/auth/status');
                const data = await res.json();

                if (data.authenticated && data.isSuspended) {
                    await signOut({ callbackUrl: '/login?error=suspended' });
                    window.location.href = '/login?error=suspended'; // HARD REDIRECT
                }
            } catch (error) {
                console.error('Suspension check failed', error);
            }
        };

        // Check immediately
        checkStatus();

        // Check every 5 seconds
        const interval = setInterval(checkStatus, 5000);

        return () => clearInterval(interval);
    }, []);

    return null; // Invisible component
}
