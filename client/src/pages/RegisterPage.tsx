import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [localError, setLocalError] = useState('');
  const [shaking, setShaking] = useState(false);
  const register = useAuthStore((s) => s.register);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }

    if (password !== confirmPw) {
      setLocalError('Passwords do not match');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }

    try {
      await register(email, password);
    } catch {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-primary relative overflow-hidden">
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-accent-secondary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 -left-32 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl" />

      <div className={`w-full max-w-md glass-card p-8 md:p-10 animate-scale-in relative ${shaking ? 'animate-shake' : ''}`}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text">✦ Thiranex</h1>
          <p className="text-text-secondary mt-2">Create your account to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); setLocalError(''); }}
                className="input-field !pl-10"
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); setLocalError(''); }}
              className="input-field"
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => { setConfirmPw(e.target.value); setLocalError(''); }}
              className="input-field"
              placeholder="Re-enter password"
              required
            />
          </div>

          {displayError && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger animate-slide-up">
              {displayError}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center !py-3 text-base">
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-tertiary hover:text-accent-primary font-medium transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
