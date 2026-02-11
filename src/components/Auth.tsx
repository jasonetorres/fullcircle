import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Loader2, ArrowLeft } from 'lucide-react';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setIsSignUp(searchParams.get('signup') === 'true');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccessMessage('Check your email for the password reset link');
        setEmail('');
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-black flex items-center justify-center p-6 overflow-hidden">
      <div className="w-full max-w-md">
        <div className="border border-white/10 rounded-2xl p-8 lg:p-10">
          <div className="text-center mb-8">
            <img
              src="/lgofc.png"
              alt="theyear"
              className="w-24 h-24 mx-auto mb-4"
            />
            <h1 className="text-2xl font-semibold text-white mb-2 tracking-tight">
              theyear
            </h1>
            <p className="text-white/60 text-[15px]">
              {isForgotPassword
                ? 'Reset your password'
                : 'Capture and share your year, one moment at a time'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-[15px] border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
              />
            </div>

            {!isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 text-[15px] border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-3 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-medium text-[15px] py-3.5 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isForgotPassword
                    ? 'Sending...'
                    : isSignUp
                    ? 'Creating account...'
                    : 'Signing in...'}
                </>
              ) : (
                <>
                  {isForgotPassword ? (
                    'Send Reset Link'
                  ) : isSignUp ? (
                    'Create Account'
                  ) : (
                    'Sign In'
                  )}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            {isForgotPassword ? (
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  setError('');
                  setSuccessMessage('');
                }}
                className="flex items-center justify-center gap-2 text-white/60 hover:text-white text-sm transition mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </button>
            ) : (
              <>
                {!isSignUp && (
                  <button
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError('');
                    }}
                    className="text-white/60 hover:text-white text-sm transition block w-full"
                  >
                    Forgot password?
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="text-white/60 hover:text-white text-sm transition block w-full"
                >
                  {isSignUp
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
