import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiClient, API_URL } from '../api/client';

interface User {
  id: number;
  username: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (force?: boolean) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Set default header
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Decode token to get user info (simple decode, not verification)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.sub,
          username: payload.username,
          avatar_url: payload.avatar_url
        });
      } catch (e) {
        console.error("Invalid token", e);
        logout();
      }
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

  const login = (force: boolean = false) => {
    // Ensure we don't have double slashes if API_URL ends with /
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    window.location.href = `${baseUrl}/auth/login${force ? '?force_login=true' : ''}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
