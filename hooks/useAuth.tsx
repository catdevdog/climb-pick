import { useState, useEffect, useCallback } from "react";
import { auth, signInAnonymously } from "../firebase/firebasedb";
import { User, onAuthStateChanged } from "firebase/auth";

interface UseAuthResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: () => Promise<void>;
}

/**
 * 사용자 인증 상태를 관리하는 커스텀 훅
 * @returns {UseAuthResult} 사용자 정보, 로딩 상태, 에러 정보, 익명 로그인 함수
 */
const useAuth = (): UseAuthResult => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 익명 로그인을 수행하는 함수
   */
  const signIn = useCallback(async () => {
    try {
      setLoading(true);
      const userCredential = await signInAnonymously(auth);
      setUser(userCredential.user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Unknown error occurred during sign in")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          setUser(user);
          setLoading(false);
        } else {
          signIn();
        }
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [signIn]);

  return { user, loading, error, signIn };
};

export default useAuth;
