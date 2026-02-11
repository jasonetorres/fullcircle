import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, TrendingUp, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-dark-text-primary">
      <header className="bg-black/80 backdrop-blur-md border-b border-dark-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/lgofc.png" alt="theyear" className="w-8 h-8" />
            <h1 className="text-lg font-semibold text-dark-text-primary tracking-tight">theyear</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 text-sm font-medium text-dark-text-secondary hover:text-dark-text-primary transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/auth?signup=true')}
              className="px-5 py-2.5 text-sm font-medium bg-white text-black rounded-lg hover:bg-gray-100 transition-all shadow-lg shadow-white/10"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24 relative">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-display font-normal mb-8 leading-[1.1] text-dark-text-primary">
                A <span className="italic">higher standard</span>
                <br />
                in life logging
              </h1>

              <p className="text-lg text-dark-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
                Document your journey with elegance. Track moments, places, and memories
                <br />
                with a platform built for those who value their story.
              </p>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/auth?signup=true')}
                  className="group px-7 py-3.5 text-base font-medium bg-white text-black rounded-lg hover:bg-gray-100 transition-all shadow-xl shadow-white/20 flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 border-t border-dark-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-5xl lg:text-6xl font-display font-normal mb-6 text-dark-text-primary">
                Built with <span className="italic">modern</span> capabilities
              </h2>
              <p className="text-lg text-dark-text-secondary max-w-2xl mx-auto">
                Everything you need to document your year, beautifully organized
                <br />
                and always accessible.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-dark-panel rounded-2xl p-8 border border-dark-border hover:border-gray-800 transition-all group">
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-800 group-hover:border-gray-700 transition-colors">
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-dark-text-primary mb-3">Daily Logging</h3>
                <p className="text-dark-text-secondary leading-relaxed text-sm">
                  Capture moments with photos, locations, and rich text. Your personal timeline, beautifully organized.
                </p>
              </div>

              <div className="bg-dark-panel rounded-2xl p-8 border border-dark-border hover:border-gray-800 transition-all group">
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-800 group-hover:border-gray-700 transition-colors">
                    <MapPin className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-dark-text-primary mb-3">Travel Tracking</h3>
                <p className="text-dark-text-secondary leading-relaxed text-sm">
                  Automatically track locations and visualize your journeys. See where you've been, remember where you want to go.
                </p>
              </div>

              <div className="bg-dark-panel rounded-2xl p-8 border border-dark-border hover:border-gray-800 transition-all group">
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-800 group-hover:border-gray-700 transition-colors">
                    <TrendingUp className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-dark-text-primary mb-3">Year in Review</h3>
                <p className="text-dark-text-secondary leading-relaxed text-sm">
                  Beautiful yearly recaps that celebrate your journey. Stats, highlights, and memories worth sharing.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 border-t border-dark-border">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-5xl lg:text-6xl font-display font-normal mb-6 text-dark-text-primary">
              Ready to <span className="italic">document</span> your year?
            </h2>
            <p className="text-lg text-dark-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
              Join theyear today. Free to use, built for those who care about
              <br />
              preserving their memories with intention.
            </p>

            <button
              onClick={() => navigate('/auth?signup=true')}
              className="group px-8 py-4 text-base font-medium bg-white text-black rounded-lg hover:bg-gray-100 transition-all shadow-2xl shadow-white/20 flex items-center gap-2 mx-auto"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-dark-border py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-sm text-dark-text-muted">
          <p>&copy; 2026 theyear. Document your year with intention.</p>
        </div>
      </footer>
    </div>
  );
}
