import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-dark-text-primary">
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/lgofc.png" alt="theyear" className="w-7 h-7" />
            <h1 className="text-[17px] font-semibold text-white tracking-tight">theyear</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 text-[15px] font-medium text-white/80 hover:text-white transition-colors duration-200"
            >
              Sign In
            </button>
            <a
              href="#"
              className="px-4 py-2 text-[15px] font-medium text-white/80 hover:text-white transition-colors duration-200"
            >
              Docs
            </a>
            <button
              onClick={() => navigate('/auth?signup=true')}
              className="px-6 py-2.5 text-[15px] font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main>
        <section
          className="relative min-h-[75vh] flex items-center overflow-hidden"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black"></div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-left">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-normal mb-6 leading-[1.1] text-white">
                  A <span className="italic">higher</span> standard
                  <br />
                  in travel journaling
                </h1>

                <p className="text-base sm:text-lg text-white/80 mb-8 max-w-xl leading-relaxed">
                  Document your journey with elegance. Track moments, places,
                  <br />
                  and memories with a platform built for those who value their story.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate('/auth?signup=true')}
                    className="px-8 py-3.5 text-[15px] font-medium text-white border border-white/40 rounded-lg hover:bg-white/10 transition-all duration-200 inline-block"
                  >
                    Get Started
                  </button>
                </div>
              </div>

              <div className="relative hidden lg:block">
                <div className="relative flex items-center justify-center">
                  <img
                    src="/phone.png"
                    alt="theyear App"
                    className="w-[400px] h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-black">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-normal mb-6 text-white tracking-tight leading-[1.1]">
                Built with <span className="italic">modern</span> capabilities
              </h2>
              <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
                Everything you need to document your travels, beautifully organized
                <br />
                and always easily accessible.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group h-96">
                <img
                  src="/dailylog.png"
                  alt="Daily Logging Interface"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">Daily Logging</h3>
                  <p className="text-white/90 leading-relaxed text-[15px]">
                    Capture each day's stories, thoughts, and highlights diary-style.
                  </p>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group h-96">
                <img
                  src="/traveltrack.png"
                  alt="Travel Tracking Interface"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">Travel Tracking</h3>
                  <p className="text-white/90 leading-relaxed text-[15px]">
                    Pin and explore your visited locations on an interactive global map.
                  </p>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group h-96">
                <img
                  src="/YIR.png"
                  alt="Year in Review Interface"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">Year in Review</h3>
                  <p className="text-white/90 leading-relaxed text-[15px]">
                    Beautiful yearly recaps that celebrate your journey with stats and highlights.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-16">
              <button
                onClick={() => navigate('/auth?signup=true')}
                className="group px-8 py-4 text-[15px] font-medium bg-white text-black rounded-lg hover:bg-gray-100 transition-all duration-200 inline-flex items-center gap-2"
              >
                Continue
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.08] py-16 bg-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-[14px] text-white/50">
          <p>&copy; 2026 theyear. Document your year with intention.</p>
        </div>
      </footer>
    </div>
  );
}
