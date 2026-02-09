import { useEffect, useState, useCallback } from 'react';
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
import NotificationToast from './components/NotificationToast';
import Memories from './components/Memories';
import { PublicRecap } from './components/PublicRecap';
import { PublicProfile } from './components/PublicProfile';
import { LogOut, Home, Compass, Plus, Search as SearchIcon, User as UserIcon } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

function MainApp() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'myLogs' | 'feed' | 'search' | 'profile'>('myLogs');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [showQuickLog, setShowQuickLog] = useState(false);

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
    setShowQuickLog(false);
  };

  const handleNotificationClick = useCallback((logId: string) => {
    setSelectedLogId(logId);
    setActiveTab('feed');
  }, []);

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
      <header className="bg-white shadow-sm sticky top-0 z-40 w-full">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/lgofc.png" alt="FullCircle" className="w-8 h-8" />
            <h1 className="text-lg font-bold text-slate-800">FullCircle</h1>
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <Notifications onNotificationClick={handleNotificationClick} userId={user.id} />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 hover:text-slate-800 transition p-2 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-slate-50 pb-20">
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-4">
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
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-bottom">
        <div className="max-w-4xl mx-auto flex items-center justify-around px-2">
          <button
            onClick={() => setActiveTab('myLogs')}
            className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] transition-colors ${
              activeTab === 'myLogs' ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            <Home className={`w-5 h-5 ${activeTab === 'myLogs' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] transition-colors ${
              activeTab === 'feed' ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            <Compass className={`w-5 h-5 ${activeTab === 'feed' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-medium">Explore</span>
          </button>
          <button
            onClick={() => setShowQuickLog(true)}
            className="flex items-center justify-center w-12 h-12 -mt-4 bg-slate-800 rounded-full shadow-lg shadow-slate-800/30 text-white active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] transition-colors ${
              activeTab === 'search' ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            <SearchIcon className={`w-5 h-5 ${activeTab === 'search' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-medium">Search</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] transition-colors ${
              activeTab === 'profile' ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            <UserIcon className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {showQuickLog && (
        <QuickLogForm
          onLogAdded={handleLogAdded}
          userId={user.id}
          onClose={() => setShowQuickLog(false)}
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
        <Route path="/recap/:userId/:year" element={<PublicRecap />} />
        <Route path="/profile/:userId" element={<PublicProfile />} />
        <Route path="*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
