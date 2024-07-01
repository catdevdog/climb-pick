import { useState, useEffect } from 'react';
import { auth, signInAnonymously } from '../firebase/firebasedb';
import { User, onAuthStateChanged } from 'firebase/auth';

interface UseAuthResult {
    user: User | null;
    loading: boolean;
    error: Error | null;
}

const useAuth = (): UseAuthResult => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                setLoading(false);
            } else {
                signInAnonymously(auth)
                    .then((userCredential) => {
                        setUser(userCredential.user);
                        setLoading(false);
                    })
                    .catch((error) => {
                        setError(error);
                        setLoading(false);
                    });
            }
        });

        return () => unsubscribe();
    }, []);

    return { user, loading, error };
};

export default useAuth;
