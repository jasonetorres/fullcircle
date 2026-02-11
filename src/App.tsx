import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { supabase, Profile } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import Auth from './components/Auth';
import Landing from './components/Landing';
import Docs from './components/Docs';
import ResetPassword from './components/ResetPassword';
import ProfileSetup from './components/ProfileSetup';
import QuickLogForm from './components/QuickLogForm';
import Timeline from './components/Timeline';
import Feed from './components/Feed';
import Search from './components/Search';
import ProfileComponent from './components/Profile';
import AccountSettings from './components/AccountSettings';
import Notifications from './components/Notifications';
import NotificationToast from './components/NotificationToast';
import Memories from './components/Memories';
import { PublicRecap } from './components/PublicRecap';
import { PublicProfile } from './components/PublicProfile';
import { LogOut, Home, Compass, Plus, Search as SearchIcon, User as UserIcon, Mail, AlertCircle } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

function MainApp() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'myLogs' | 'feed' | 'search' | 'profile'>(() => {
    const savedTab = localStorage.getItem('activeTab');
    return (savedTab as 'myLogs' | 'feed' | 'search' | 'profile') || 'myLogs';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [showQuickLog, setShowQuickLog] = useState(false);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location]);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        (async () => {
          setUser(session?.user ?? null);
          if (session?.user) {
            await checkProfile(session.user.id);
          }
        })();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      console.error('Error checking profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;
      alert('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      alert(err.message || 'Failed to send verification email');
    }
  };

  const handleLogAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
    setShowQuickLog(false);
    setActiveTab('myLogs');

    const toast = document.createElement('div');
    toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[70] animate-fade-in font-medium';
    toast.textContent = 'Post created successfully!';
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  };

  const handleNotificationClick = useCallback((logId: string) => {
    setSelectedLogId(logId);
    setActiveTab('feed');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 dark:border-dark-border border-t-slate-800 dark:border-t-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  if (!profile) {
    return <ProfileSetup userId={user.id} onComplete={() => checkProfile(user.id)} />;
  }

  return (
    <>
      <div className="h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-dark-bg">
        <header className="bg-white dark:bg-dark-panel shadow-sm dark:shadow-dark-border/50 border-b dark:border-dark-border z-40 w-full flex-shrink-0">
          <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img src="/lgofc.png" alt="theyear" className="w-8 h-8" />
              <h1 className="text-lg font-bold text-slate-800 dark:text-dark-text-primary">theyear</h1>
            </button>

            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('myLogs')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'myLogs'
                    ? 'bg-slate-100 dark:bg-dark-hover text-slate-900 dark:text-orange-500'
                    : 'text-slate-600 dark:text-dark-text-secondary hover:text-slate-800 dark:hover:text-dark-text-primary hover:bg-slate-50 dark:hover:bg-dark-hover'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium">Home</span>
              </button>
              <button
                onClick={() => setActiveTab('feed')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'feed'
                    ? 'bg-slate-100 dark:bg-dark-hover text-slate-900 dark:text-orange-500'
                    : 'text-slate-600 dark:text-dark-text-secondary hover:text-slate-800 dark:hover:text-dark-text-primary hover:bg-slate-50 dark:hover:bg-dark-hover'
                }`}
              >
                <Compass className="w-5 h-5" />
                <span className="text-sm font-medium">Explore</span>
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'search'
                    ? 'bg-slate-100 dark:bg-dark-hover text-slate-900 dark:text-orange-500'
                    : 'text-slate-600 dark:text-dark-text-secondary hover:text-slate-800 dark:hover:text-dark-text-primary hover:bg-slate-50 dark:hover:bg-dark-hover'
                }`}
              >
                <SearchIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Search</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-slate-100 dark:bg-dark-hover text-slate-900 dark:text-orange-500'
                    : 'text-slate-600 dark:text-dark-text-secondary hover:text-slate-800 dark:hover:text-dark-text-primary hover:bg-slate-50 dark:hover:bg-dark-hover'
                }`}
              >
                <UserIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Profile</span>
              </button>
            </nav>

            <div className="flex items-center gap-1 text-slate-600 dark:text-dark-text-secondary">
              <button
                onClick={() => setShowQuickLog(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-800 dark:bg-orange-500 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-orange-600 transition text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden lg:inline">New Log</span>
              </button>
              <Notifications onNotificationClick={handleNotificationClick} userId={user.id} />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 hover:text-slate-800 dark:hover:text-dark-text-primary hover:bg-slate-100 dark:hover:bg-dark-hover transition p-2 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {!user.email_confirmed_at && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/50">
            <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">
                  Please verify your email address
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300/80 mb-2">
                  Check your inbox for a verification link. You won't be able to create posts until your email is verified.
                </p>
                <button
                  onClick={handleResendVerification}
                  className="text-xs font-medium text-amber-800 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 underline transition"
                >
                  Resend verification email
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-dark-bg scrollbar-hide">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            {activeTab === 'myLogs' ? (
              <>
                <Memories userId={user.id} />
                <Timeline userId={user.id} refreshTrigger={refreshTrigger} />
              </>
            ) : activeTab === 'feed' ? (
              <Feed
                key={user.id}
                userId={user.id}
                initialLogId={selectedLogId}
                onLogOpened={() => setSelectedLogId(null)}
              />
            ) : activeTab === 'search' ? (
              <Search userId={user.id} />
            ) : (
              <ProfileComponent
                userId={user.id}
                currentUserId={user.id}
                onOpenSettings={() => setShowSettings(true)}
              />
            )}
          </div>
        </main>

        <nav className="md:hidden bg-white dark:bg-dark-panel border-t border-slate-200 dark:border-dark-border pb-8 safe-area-bottom z-50 flex-shrink-0">
          <div className="max-w-4xl mx-auto flex items-center justify-around px-2">
            <button
              onClick={() => setActiveTab('myLogs')}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] transition-colors ${
                activeTab === 'myLogs' ? 'text-slate-900 dark:text-orange-500' : 'text-slate-400 dark:text-dark-text-muted'
              }`}
            >
              <Home className={`w-5 h-5 ${activeTab === 'myLogs' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium">Home</span>
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] transition-colors ${
                activeTab === 'feed' ? 'text-slate-900 dark:text-orange-500' : 'text-slate-400 dark:text-dark-text-muted'
              }`}
            >
              <Compass className={`w-5 h-5 ${activeTab === 'feed' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium">Explore</span>
            </button>
            <button
              onClick={() => setShowQuickLog(true)}
              className="flex items-center justify-center w-12 h-12 -mt-4 bg-slate-800 dark:bg-orange-500 rounded-full shadow-lg shadow-slate-800/30 dark:shadow-orange-500/30 text-white active:scale-95 transition-transform"
            >
              <Plus className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] transition-colors ${
                activeTab === 'search' ? 'text-slate-900 dark:text-orange-500' : 'text-slate-400 dark:text-dark-text-muted'
              }`}
            >
              <SearchIcon className={`w-5 h-5 ${activeTab === 'search' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium">Search</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] transition-colors ${
                activeTab === 'profile' ? 'text-slate-900 dark:text-orange-500' : 'text-slate-400 dark:text-dark-text-muted'
              }`}
            >
              <UserIcon className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium">Profile</span>
            </button>
          </div>
        </nav>
      </div>

      {showQuickLog && (
        <QuickLogForm
          onLogAdded={handleLogAdded}
          userId={user.id}
          onClose={() => setShowQuickLog(false)}
          emailVerified={!!user.email_confirmed_at}
        />
      )}

      {showSettings && (
        <AccountSettings
          userId={user.id}
          onClose={() => setShowSettings(false)}
          onProfileUpdated={() => {
            checkProfile(user.id);
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      )}

      <NotificationToast userId={user.id} onNotificationClick={handleNotificationClick} />
      <Analytics />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/recap/:userId/:year" element={<PublicRecap />} />
        <Route path="/profile/:userId" element={<PublicProfile />} />
        <Route path="*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
