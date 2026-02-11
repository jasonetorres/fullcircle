import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setIsSignUp(searchParams.get('signup') === 'true');
  }, [searchParams]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/');
      }
    });
  }, [navigate]);

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
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (username.length < 3 || username.length > 20) {
          setError('Username must be between 3 and 20 characters');
          setLoading(false);
          return;
        }

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            username: username.toLowerCase().trim(),
            display_name: displayName.trim() || null,
          });

          if (profileError) {
            if (profileError.code === '23505') {
              setError('Username already taken. Please choose another.');
            } else {
              throw profileError;
            }
            setLoading(false);
            return;
          }

          setSuccessMessage('Account created! Check your email to verify your account.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 overflow-y-auto py-12">
      <div className="w-full max-w-md">
        <div className="border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-10">
          <div className={`text-center ${isSignUp && !isForgotPassword ? 'mb-6' : 'mb-8'}`}>
            <img
              src="/lgofc.png"
              alt="theyear"
              className={`mx-auto ${isSignUp && !isForgotPassword ? 'w-16 h-16 mb-3' : 'w-24 h-24 mb-4'}`}
            />
            <h1 className="text-2xl font-semibold text-white mb-2 tracking-tight">
              {isForgotPassword
                ? 'Reset Password'
                : isSignUp
                ? 'Create Account'
                : 'Welcome Back'}
            </h1>
            <p className="text-white/60 text-[15px]">
              {isForgotPassword
                ? 'Enter your email to reset your password'
                : isSignUp
                ? 'Start capturing and sharing your year'
                : 'Sign in to continue your journey'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className={isSignUp && !isForgotPassword ? 'space-y-3' : 'space-y-4'}>
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
              <>
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

                {isSignUp && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 text-[15px] border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none transition"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        maxLength={50}
                        className="w-full px-4 py-3 text-[15px] border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none transition"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-300 mb-1">
                          Username is permanent
                        </p>
                        <p className="text-xs text-amber-200/80">
                          Your username cannot be changed after account creation. Choose carefully.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                        required
                        minLength={3}
                        maxLength={20}
                        className="w-full px-4 py-3 text-[15px] border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none transition"
                        placeholder="johndoe"
                      />
                      <p className="text-xs text-white/50 mt-1.5">
                        3-20 characters, letters, numbers, and underscores only
                      </p>
                    </div>
                  </>
                )}
              </>
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
                    setConfirmPassword('');
                    setDisplayName('');
                    setUsername('');
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
