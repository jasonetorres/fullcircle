import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase, Profile as ProfileType } from '../lib/supabase';
import { ArrowLeft, User } from 'lucide-react';
import Profile from './Profile';

export function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileType | null>(null);

  useEffect(() => {
    checkAuth();
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user?.id || null);
  };

  const fetchProfile = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!loading && !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Profile Not Found</h2>
          <p className="text-slate-600 mb-6">This user does not exist.</p>
          {currentUser ? (
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
            >
              Go Home
            </button>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/lgofc.png" alt="theyear" className="w-8 h-8" />
              <h1 className="text-lg font-bold text-slate-800">theyear</h1>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition text-sm"
            >
              Sign In
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-4">
          <Profile
            userId={userId!}
            currentUserId=""
            onOpenSettings={() => {}}
          />
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (location.state?.from === 'feed') {
      navigate('/', { state: { tab: 'feed' } });
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition touch-target-sm p-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <img src="/lgofc.png" alt="theyear" className="w-8 h-8" />
            <h1 className="text-lg font-bold text-slate-800">theyear</h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition text-sm"
          >
            Home
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4">
        <Profile
          userId={userId!}
          currentUserId={currentUser}
          onOpenSettings={() => {}}
        />
      </div>
    </div>
  );
}
