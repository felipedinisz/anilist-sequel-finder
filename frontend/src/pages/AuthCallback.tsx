import { useEffect } from 'react';

export const AuthCallback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      // Force reload to pick up the token in AuthContext (or we could expose setToken)
      window.location.href = '/';
    } else {
      // If no token, redirect to home or login
      window.location.href = '/';
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};
