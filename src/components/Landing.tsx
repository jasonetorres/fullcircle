import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, TrendingUp, Globe, Lock, Sparkles, ArrowRight, Check } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <header className="bg-dark-panel/80 backdrop-blur-md border-b border-dark-border sticky top-0 z-50 shadow-dark-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/lgofc.png" alt="theyear" className="w-9 h-9 drop-shadow-lg" />
            <h1 className="text-xl font-bold text-white">theyear</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="px-5 py-2.5 text-sm font-medium text-dark-text-secondary hover:text-white transition-colors duration-200"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/auth?signup=true')}
              className="px-5 py-2.5 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-panel border border-dark-border rounded-full mb-8 shadow-card-dark">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-dark-text-secondary">
                  Capture every moment of your year
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Your life's journey,
                <br />
                <span className="bg-gradient-to-r from-orange-400 to-pink-400 text-transparent bg-clip-text">
                  beautifully documented
                </span>
              </h1>

              <p className="text-xl text-dark-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
                Log daily moments, track your travels, and share your experiences. Create a stunning timeline of your year with theyear.
              </p>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                <button
                  onClick={() => navigate('/auth?signup=true')}
                  className="group px-8 py-4 text-base font-semibold bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-200 shadow-xl shadow-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/50 flex items-center gap-2"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="px-8 py-4 text-base font-semibold bg-dark-panel text-white border border-dark-border rounded-xl hover:bg-dark-hover transition-all duration-200 shadow-card-dark hover:shadow-card-hover-dark"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-dark-panel/50 border-y border-dark-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              <div className="bg-dark-panel rounded-2xl p-8 border border-dark-border shadow-card-dark hover:shadow-card-hover-dark transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Daily Logging</h3>
                <p className="text-dark-text-secondary leading-relaxed">
                  Effortlessly capture your daily moments with photos, locations, and stories. Build your personal timeline of memories.
                </p>
              </div>

              <div className="bg-dark-panel rounded-2xl p-8 border border-dark-border shadow-card-dark hover:shadow-card-hover-dark transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Travel Tracking</h3>
                <p className="text-dark-text-secondary leading-relaxed">
                  Track your adventures and trips. See all the places you've been and relive your favorite travel memories.
                </p>
              </div>

              <div className="bg-dark-panel rounded-2xl p-8 border border-dark-border shadow-card-dark hover:shadow-card-hover-dark transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Social Sharing</h3>
                <p className="text-dark-text-secondary leading-relaxed">
                  Connect with friends, share your experiences, and explore what others are up to. Build your community.
                </p>
              </div>

              <div className="bg-dark-panel rounded-2xl p-8 border border-dark-border shadow-card-dark hover:shadow-card-hover-dark transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Year in Review</h3>
                <p className="text-dark-text-secondary leading-relaxed">
                  Get beautiful yearly recaps that showcase your journey, stats, and highlights. Share your story with the world.
                </p>
              </div>

              <div className="bg-dark-panel rounded-2xl p-8 border border-dark-border shadow-card-dark hover:shadow-card-hover-dark transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-slate-500/30">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Privacy Control</h3>
                <p className="text-dark-text-secondary leading-relaxed">
                  Keep moments private or share with the world. You decide what to share and with whom.
                </p>
              </div>

              <div className="bg-dark-panel rounded-2xl p-8 border border-dark-border shadow-card-dark hover:shadow-card-hover-dark transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-rose-500/30">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Explore Feed</h3>
                <p className="text-dark-text-secondary leading-relaxed">
                  Discover public moments from people around the world. Get inspired and connect with new experiences.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-3xl p-12 border border-orange-500/20 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-dark-panel/80 backdrop-blur-sm"></div>

              <div className="relative text-center">
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                  Ready to capture this year?
                </h2>
                <p className="text-xl text-dark-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
                  Join theyear today and start building your personal timeline of memories.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                  <div className="flex items-center gap-2 text-dark-text-secondary">
                    <Check className="w-5 h-5 text-orange-500" />
                    <span>Free to use</span>
                  </div>
                  <div className="flex items-center gap-2 text-dark-text-secondary">
                    <Check className="w-5 h-5 text-orange-500" />
                    <span>Unlimited logs</span>
                  </div>
                  <div className="flex items-center gap-2 text-dark-text-secondary">
                    <Check className="w-5 h-5 text-orange-500" />
                    <span>Beautiful yearly recaps</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/auth?signup=true')}
                  className="group px-10 py-4 text-lg font-semibold bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-200 shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/70 flex items-center gap-2 mx-auto"
                >
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-dark-panel border-t border-dark-border mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-dark-text-muted">
          <p>&copy; 2026 theyear. Capture and share your year, one moment at a time.</p>
        </div>
      </footer>
    </div>
  );
}
