import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { login as loginApi, getMe, AuthUser } from '../api/auth.api';
import { setOnUnauthorized } from '../api/axiosInstance';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  }, []);

  // Let axiosInstance log the user out automatically if any request comes back 401.
  useEffect(() => {
    setOnUnauthorized(logout);
  }, [logout]);

  // On first load, try to restore the session from a saved token.
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    setToken(savedToken);
    getMe()
      .then(setUser)
      .catch(() => {
        // Token is expired/invalid — treat as logged out.
        logout();
      })
      .finally(() => setIsLoading(false));
  }, [logout]);

  async function login(email: string, password: string) {
    const { token: newToken, user: newUser } = await loginApi(email, password);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  }

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
