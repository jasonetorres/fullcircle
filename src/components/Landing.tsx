import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, TrendingUp, Globe, Lock } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/lgofc.png" alt="thisyear" className="w-8 h-8" />
            <h1 className="text-lg font-bold text-slate-800">thisyear</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/auth?signup=true')}
              className="px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <section className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Document your year,
            <br />
            <span className="text-slate-600">one moment at a time</span>
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Capture, share, and relive your life's journey with thisyear. A beautiful space to log your experiences and create lasting memories.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/auth?signup=true')}
              className="px-8 py-3.5 text-base font-semibold bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition shadow-lg shadow-slate-800/20"
            >
              Start Your Journey
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-3.5 text-base font-semibold text-slate-700 border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition"
            >
              Sign In
            </button>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Daily Logging</h3>
            <p className="text-slate-600">
              Effortlessly capture your daily moments with photos, locations, and stories. Build your personal timeline of memories.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Travel Tracking</h3>
            <p className="text-slate-600">
              Track your adventures and trips. See all the places you've been and relive your favorite travel memories.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Social Sharing</h3>
            <p className="text-slate-600">
              Connect with friends, share your experiences, and explore what others are up to. Build your community.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Year in Review</h3>
            <p className="text-slate-600">
              Get beautiful yearly recaps that showcase your journey, stats, and highlights. Share your story with the world.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Privacy Control</h3>
            <p className="text-slate-600">
              Keep moments private or share with the world. You decide what to share and with whom.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Explore Feed</h3>
            <p className="text-slate-600">
              Discover public moments from people around the world. Get inspired and connect with new experiences.
            </p>
          </div>
        </section>

        <section className="text-center bg-slate-50 rounded-3xl p-12 border border-slate-100">
          <h3 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to capture this year?
          </h3>
          <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
            Join thisyear today and start building your personal timeline of memories. Free to use, easy to love.
          </p>
          <button
            onClick={() => navigate('/auth?signup=true')}
            className="px-8 py-3.5 text-base font-semibold bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition shadow-lg shadow-slate-800/20"
          >
            Get Started for Free
          </button>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-slate-600">
          <p>&copy; 2026 thisyear. Capture and share your year, one moment at a time.</p>
        </div>
      </footer>
    </div>
  );
}
