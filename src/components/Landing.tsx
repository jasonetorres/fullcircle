import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-dark-text-primary">
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/lgofc.png" alt="theyear" className="w-6 h-6 sm:w-7 sm:h-7" />
            <h1 className="text-[15px] sm:text-[17px] font-semibold text-white tracking-tight">theyear</h1>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-[13px] sm:text-[15px] font-medium text-white/80 hover:text-white transition-colors duration-200"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/docs')}
              className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-[13px] sm:text-[15px] font-medium text-white/80 hover:text-white transition-colors duration-200"
            >
              Docs
            </button>
            <button
              onClick={() => navigate('/auth?signup=true')}
              className="px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 text-[12px] sm:text-[14px] lg:text-[15px] font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main>
        <section
          className="relative min-h-[70vh] sm:min-h-[75vh] flex items-center overflow-hidden"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-normal mb-4 sm:mb-6 leading-[1.15] sm:leading-[1.1] text-white">
                  A <span className="italic">higher</span> standard in travel journaling
                </h1>

                <p className="text-sm sm:text-base lg:text-lg text-white/80 mb-6 sm:mb-8 max-w-xl leading-relaxed">
                  Document your journey with elegance. Track moments, places, and memories with a platform built for those who value their story.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => navigate('/auth?signup=true')}
                    className="px-6 sm:px-8 py-3 sm:py-3.5 text-[14px] sm:text-[15px] font-medium text-white border border-white/40 rounded-lg hover:bg-white/10 transition-all duration-200 inline-block"
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

        <section className="py-10 sm:py-12 lg:py-16 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-14 lg:mb-20">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-normal mb-3 sm:mb-4 lg:mb-6 text-white tracking-tight leading-[1.15] sm:leading-[1.1]">
                Built with <span className="italic">modern</span> capabilities
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed px-4">
                Everything you need to document your travels, beautifully organized and always easily accessible.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group h-72 sm:h-80 lg:h-96">
                <img
                  src="/dailylog.png"
                  alt="Daily Logging Interface"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-1.5 sm:mb-2 lg:mb-3 tracking-tight">Daily Logging</h3>
                  <p className="text-white/90 leading-relaxed text-[13px] sm:text-[14px] lg:text-[15px]">
                    Capture each day's stories, thoughts, and highlights diary-style.
                  </p>
                </div>
              </div>

              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group h-72 sm:h-80 lg:h-96">
                <img
                  src="/traveltrack.png"
                  alt="Travel Tracking Interface"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-1.5 sm:mb-2 lg:mb-3 tracking-tight">Travel Tracking</h3>
                  <p className="text-white/90 leading-relaxed text-[13px] sm:text-[14px] lg:text-[15px]">
                    Pin and explore your visited locations on an interactive global map.
                  </p>
                </div>
              </div>

              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group h-72 sm:h-80 lg:h-96">
                <img
                  src="/YIR.png"
                  alt="Year in Review Interface"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-1.5 sm:mb-2 lg:mb-3 tracking-tight">Year in Review</h3>
                  <p className="text-white/90 leading-relaxed text-[13px] sm:text-[14px] lg:text-[15px]">
                    Beautiful yearly recaps that celebrate your journey with stats and highlights.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-8 sm:mt-12 lg:mt-16">
              <button
                onClick={() => navigate('/auth?signup=true')}
                className="group px-6 sm:px-8 py-3 sm:py-4 text-[14px] sm:text-[15px] font-medium bg-white text-black rounded-lg hover:bg-gray-100 transition-all duration-200 inline-flex items-center gap-2"
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

      <footer className="border-t border-white/[0.08] py-8 sm:py-12 lg:py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[13px] sm:text-[14px] text-white/50">
          <p>&copy; 2026 theyear. Document your year with intention.</p>
        </div>
      </footer>
    </div>
  );
}
