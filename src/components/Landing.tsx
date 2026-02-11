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
          <nav className="hidden md:flex items-center gap-8 text-[15px] text-white/80">
            <button className="hover:text-white transition-colors duration-200">Features</button>
            <button className="hover:text-white transition-colors duration-200">About</button>
            <button className="hover:text-white transition-colors duration-200">Blog</button>
          </nav>
          <button
            onClick={() => navigate('/auth?signup=true')}
            className="px-6 py-2.5 text-[15px] font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-all duration-200"
          >
            Get Started
          </button>
        </div>
      </header>

      <main>
        <section
          className="relative min-h-[90vh] flex items-center overflow-hidden"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"></div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 w-full">
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

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    onClick={() => navigate('/auth?signup=true')}
                    className="px-8 py-3.5 text-[15px] font-medium text-white border border-white/40 rounded-lg hover:bg-white/10 transition-all duration-200 inline-block"
                  >
                    Get Started
                  </button>
                </div>

                <div className="flex gap-4">
                  <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                    <img
                      src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83"
                      alt="Download on App Store"
                      className="h-10"
                    />
                  </a>
                  <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                      alt="Get it on Google Play"
                      className="h-10"
                    />
                  </a>
                </div>
              </div>

              <div className="relative hidden lg:block">
                <div className="relative flex items-center justify-center gap-6">
                  <div className="transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                    <img
                      src="/YIR.png"
                      alt="App Preview 1"
                      className="w-72 rounded-3xl shadow-2xl"
                    />
                  </div>
                  <div className="transform rotate-6 hover:rotate-0 transition-transform duration-500 -ml-12 mt-8">
                    <img
                      src="/YIR.png"
                      alt="App Preview 2"
                      className="w-72 rounded-3xl shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-black">
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
              <div className="bg-gradient-to-b from-[#1a1a1a] to-black rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 group">
                <div className="mb-6 bg-white/5 rounded-xl p-4 inline-block">
                  <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>

                <div className="mb-6 overflow-hidden rounded-xl">
                  <img
                    src="/dailylog.png"
                    alt="Daily Logging Interface"
                    className="w-full h-auto"
                  />
                </div>

                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Daily Logging</h3>
                <p className="text-white/70 leading-relaxed text-[15px]">
                  Capture each day's stories, thoughts, and highlight diary-style.
                </p>
              </div>

              <div className="bg-gradient-to-b from-[#1a1a1a] to-black rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 group">
                <div className="mb-6 bg-white/5 rounded-xl p-4 inline-block">
                  <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                    <polyline points="21 15 16 10 5 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <div className="mb-6 overflow-hidden rounded-xl">
                  <img
                    src="/YIR.png"
                    alt="Photo Memories Interface"
                    className="w-full h-auto"
                  />
                </div>

                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Photo Memories</h3>
                <p className="text-white/70 leading-relaxed text-[15px]">
                  Save and organize your favorite travel photos in stunning albums.
                </p>
              </div>

              <div className="bg-gradient-to-b from-[#1a1a1a] to-black rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 group">
                <div className="mb-6 bg-white/5 rounded-xl p-4 inline-block">
                  <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="10" r="3" strokeWidth="2"/>
                  </svg>
                </div>

                <div className="mb-6 overflow-hidden rounded-xl">
                  <img
                    src="/YIR.png"
                    alt="Interactive Map Interface"
                    className="w-full h-auto"
                  />
                </div>

                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Interactive Map</h3>
                <p className="text-white/70 leading-relaxed text-[15px]">
                  Pin and explore your visited locations on a global map of your adventures.
                </p>
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
