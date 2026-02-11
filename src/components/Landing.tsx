import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, TrendingUp, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-dark-text-primary">
      <header className="bg-black/90 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/lgofc.png" alt="theyear" className="w-7 h-7" />
            <h1 className="text-[17px] font-semibold text-dark-text-primary tracking-tight">theyear</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 text-[14px] font-medium text-dark-text-secondary hover:text-dark-text-primary transition-colors duration-200"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/auth?signup=true')}
              className="px-5 py-2 text-[14px] font-medium bg-white text-black rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-32 sm:pt-36 sm:pb-40 relative">
            <div className="text-center max-w-5xl mx-auto">
              <h1 className="text-6xl sm:text-7xl lg:text-[7rem] font-display font-normal mb-10 leading-[1.05] text-dark-text-primary tracking-tight">
                A <span className="italic">higher standard</span>
                <br />
                in life logging
              </h1>

              <p className="text-base sm:text-lg text-dark-text-secondary mb-14 max-w-2xl mx-auto leading-relaxed">
                Track daily moments, travels, and memories with elegant simplicity.
                <br />
                Built for those who value their story.
              </p>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/auth?signup=true')}
                  className="group px-8 py-3.5 text-[15px] font-medium bg-white text-black rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-40 border-t border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-24">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-display font-normal mb-7 text-dark-text-primary tracking-tight leading-[1.1]">
                Built with <span className="italic">modern</span> capabilities
              </h2>
              <p className="text-base sm:text-lg text-dark-text-secondary max-w-2xl mx-auto leading-relaxed">
                Everything you need to document your year, beautifully organized
                <br />
                and always accessible.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto">
              <div className="bg-dark-panel rounded-xl p-10 border border-white/[0.08] hover:border-gray-800/60 transition-all duration-300 group">
                <div className="mb-8">
                  <div className="w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-300">
                    <Calendar className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="text-[19px] font-semibold text-dark-text-primary mb-3.5 tracking-tight">Daily Logging</h3>
                <p className="text-dark-text-secondary leading-relaxed text-[15px]">
                  Capture moments with photos, locations, and rich text. Your personal timeline, beautifully organized.
                </p>
              </div>

              <div className="bg-dark-panel rounded-xl p-10 border border-white/[0.08] hover:border-gray-800/60 transition-all duration-300 group">
                <div className="mb-8">
                  <div className="w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-300">
                    <MapPin className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="text-[19px] font-semibold text-dark-text-primary mb-3.5 tracking-tight">Travel Tracking</h3>
                <p className="text-dark-text-secondary leading-relaxed text-[15px]">
                  Automatically track locations and visualize your journeys. See where you've been, remember where you want to go.
                </p>
              </div>

              <div className="bg-dark-panel rounded-xl p-10 border border-white/[0.08] hover:border-gray-800/60 transition-all duration-300 group">
                <div className="mb-8">
                  <div className="w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-300">
                    <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="text-[19px] font-semibold text-dark-text-primary mb-3.5 tracking-tight">Year in Review</h3>
                <p className="text-dark-text-secondary leading-relaxed text-[15px]">
                  Beautiful yearly recaps that celebrate your journey. Stats, highlights, and memories worth sharing.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-40 border-t border-white/[0.08]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-display font-normal mb-8 text-dark-text-primary tracking-tight leading-[1.1]">
              Ready to <span className="italic">document</span> your year?
            </h2>
            <p className="text-base sm:text-lg text-dark-text-secondary mb-14 max-w-2xl mx-auto leading-relaxed">
              Join theyear today. Free to use, built for those who care about
              <br />
              preserving their memories with intention.
            </p>

            <button
              onClick={() => navigate('/auth?signup=true')}
              className="group px-8 py-3.5 text-[15px] font-medium bg-white text-black rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.08] py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-[14px] text-dark-text-muted">
          <p>&copy; 2026 theyear. Document your year with intention.</p>
        </div>
      </footer>
    </div>
  );
}
