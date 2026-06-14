import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { githubCallback } from '../services/api';
import { Loader2, AlertCircle } from 'lucide-react';

const PROCESSED_KEY = 'gh_code_processing';

export default function GitHubCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) { navigate('/login', { replace: true }); return; }

    if (sessionStorage.getItem(PROCESSED_KEY) === code) return;
    sessionStorage.setItem(PROCESSED_KEY, code);

    githubCallback(code)
      .then(() => {
        sessionStorage.removeItem(PROCESSED_KEY);
        navigate('/explorar', { replace: true });
      })
      .catch(err => {
        sessionStorage.removeItem(PROCESSED_KEY);
        setError(err.message || 'Error al autenticar con GitHub.');
      });
  
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-[#020B18]">
        <div className="flex items-center gap-3 p-5 bg-red-500/10 border border-red-500/30 rounded-2xl max-w-sm text-center">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
        <a href="/login" className="text-[#60A5FA] text-sm hover:text-white transition-colors">
          ← Volver al inicio de sesión
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#020B18]">
      <div className="w-14 h-14 rounded-2xl bg-[#0D1B38] border border-white/10 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white/80">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      </div>
      <div className="text-center">
        <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin mx-auto mb-2" />
        <p className="text-white/50 text-sm">Autenticando con GitHub…</p>
      </div>
    </div>
  );
}
