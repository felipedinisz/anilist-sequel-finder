import { useEffect, useRef } from 'react';
import { verifyToken } from '../api/client';

export const AuthCallback = () => {
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const handleCallback = async () => {
      // Check for Implicit Grant (hash)
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get('access_token');

      // Check for Authorization Code (query param) - legacy support
      const queryParams = new URLSearchParams(window.location.search);
      const token = queryParams.get('token'); // JWT from backend redirect

      if (accessToken) {
        try {
          // Verify AniList token with backend and get JWT
          const data = await verifyToken(accessToken);
          if (data.token) {
            localStorage.setItem('token', data.token);
            window.location.href = '/';
          }
        } catch (error) {
          console.error("Login failed", error);
          window.location.href = '/';
        }
      } else if (token) {
        localStorage.setItem('token', token);
        window.location.href = '/';
      } else {
        // No token found
        window.location.href = '/';
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1622] text-white flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="text-gray-400">Authenticating...</p>
    </div>
  );
};
