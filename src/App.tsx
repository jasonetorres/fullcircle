import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase, Profile } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import Auth from './components/Auth';
import ProfileSetup from './components/ProfileSetup';
import QuickLogForm from './components/QuickLogForm';
import Timeline from './components/Timeline';
import Feed from './components/Feed';
import Search from './components/Search';
import ProfileComponent from './components/Profile';
import AccountSettings from './components/AccountSettings';
import Notifications from './components/Notifications';
import { PublicRecap } from './components/PublicRecap';
import { LogOut, Home, Compass, Search as SearchIcon, User as UserIcon } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

function MainApp() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'myLogs' | 'feed' | 'search' | 'profile'>('myLogs');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

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

  const handleLogAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleNotificationClick = (logId: string) => {
    setSelectedLogId(logId);
    setActiveTab('feed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-slate-800"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (!profile) {
    return <ProfileSetup userId={user.id} onComplete={() => checkProfile(user.id)} />;
  }

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50 w-full">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/lgofc.png"
              alt="FullCircle"
              className="w-8 h-8"
            />
            <h1 className="text-lg font-bold text-slate-800">FullCircle</h1>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Notifications onNotificationClick={handleNotificationClick} />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 hover:text-slate-800 transition p-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Sign Out</span>
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-2 flex gap-1">
            <button
              onClick={() => setActiveTab('myLogs')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition border-b-2 ${
                activeTab === 'myLogs'
                  ? 'border-slate-800 text-slate-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">My Logs</span>
              <span className="sm:hidden">Logs</span>
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition border-b-2 ${
                activeTab === 'feed'
                  ? 'border-slate-800 text-slate-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore</span>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition border-b-2 ${
                activeTab === 'search'
                  ? 'border-slate-800 text-slate-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <SearchIcon className="w-4 h-4" />
              <span>Search</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition border-b-2 ${
                activeTab === 'profile'
                  ? 'border-slate-800 text-slate-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-slate-50">
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-4 pb-8">
            {activeTab === 'myLogs' ? (
              <>
                <QuickLogForm onLogAdded={handleLogAdded} userId={user.id} />
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
      </div>

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
      <Analytics />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/recap/:userId/:year" element={<PublicRecap />} />
        <Route path="*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
