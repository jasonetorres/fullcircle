import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone, Download, Share2, MoreVertical, Home, Calendar, MapPin, Users, Trophy } from 'lucide-react';

export default function Docs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2.5">
            <img src="/lgofc.png" alt="theyear" className="w-7 h-7" />
            <h1 className="text-[17px] font-semibold">theyear</h1>
          </div>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-slate-400">Everything you need to know about theyear</p>
        </div>

        <div className="space-y-16">
          {/* About Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-orange-500" />
              </div>
              About theyear
            </h2>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">theyear</strong> is a modern digital journal that helps you document and cherish every moment of your year.
                It's designed to make logging your daily experiences effortless while providing beautiful insights into your life over time.
              </p>
              <p>
                Whether you're traveling the world, building new habits, or simply want to remember the little moments that make life special,
                theyear gives you the tools to capture, organize, and reflect on your experiences.
              </p>
            </div>
          </section>

          {/* Features Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quick Logging</h3>
                <p className="text-slate-400">
                  Capture moments in seconds with our streamlined quick log feature. Add photos, locations, and notes instantly.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Location Tracking</h3>
                <p className="text-slate-400">
                  Automatically save locations with your logs. See everywhere you've been on an interactive map and track your travels.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Social Features</h3>
                <p className="text-slate-400">
                  Follow friends, like and comment on logs, and share your experiences. Keep your logs private or share with the world.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Year in Review</h3>
                <p className="text-slate-400">
                  Get a beautiful recap of your year with stats, photos, and highlights. Share your journey with friends and family.
                </p>
              </div>
            </div>
          </section>

          {/* Getting Started Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6">Getting Started</h2>
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Create Your Account</h3>
                    <p className="text-slate-400">
                      Sign up with your email address. It's quick, free, and secure. Your data is protected with industry-standard encryption.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Set Up Your Profile</h3>
                    <p className="text-slate-400">
                      Choose a username, add a bio, and upload a profile picture. Customize your privacy settings to control who can see your logs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Create Your First Log</h3>
                    <p className="text-slate-400">
                      Click the "+" button to create your first log. Add a photo, write about your day, tag the location, and save your memory.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Add to Home Screen</h3>
                    <p className="text-slate-400">
                      For the best experience, install theyear on your phone's home screen. See instructions below for your device.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* iOS Installation */}
          <section>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-orange-500" />
              </div>
              Add to Home Screen (iOS)
            </h2>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-6">
              <p className="text-slate-300">
                Install theyear as a Progressive Web App (PWA) on your iPhone or iPad for the best experience:
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-500 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Open Safari</h4>
                    <p className="text-slate-400">Navigate to theyear.app in the Safari browser (this won't work in Chrome or other browsers on iOS).</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-500 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                      Tap the Share Button
                      <Share2 className="w-4 h-4 text-slate-400" />
                    </h4>
                    <p className="text-slate-400">Look for the share icon at the bottom of your screen (a square with an arrow pointing up).</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-500 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Scroll and Select "Add to Home Screen"</h4>
                    <p className="text-slate-400">In the share menu, scroll down until you see "Add to Home Screen" with a plus icon.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-500 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Confirm Installation</h4>
                    <p className="text-slate-400">Tap "Add" in the top right corner. The theyear icon will appear on your home screen!</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-sm text-slate-400">
                  <strong className="text-white">💡 Tip:</strong> Once installed, theyear will work just like a native app with offline support,
                  push notifications, and a full-screen experience.
                </p>
              </div>
            </div>
          </section>

          {/* Android Installation */}
          <section>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-orange-500" />
              </div>
              Add to Home Screen (Android)
            </h2>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-6">
              <p className="text-slate-300">
                Install theyear on your Android device using Chrome or any Chromium-based browser:
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-500 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Open Chrome</h4>
                    <p className="text-slate-400">Navigate to theyear.app in the Chrome browser (or Edge, Samsung Internet, Firefox, etc.).</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-500 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                      Tap the Menu Button
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </h4>
                    <p className="text-slate-400">Look for the three dots in the top right corner of your browser.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-500 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                      Select "Add to Home Screen" or "Install App"
                      <Download className="w-4 h-4 text-slate-400" />
                    </h4>
                    <p className="text-slate-400">You might also see a banner at the bottom of the screen prompting you to install.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-500 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Confirm Installation</h4>
                    <p className="text-slate-400">Tap "Install" or "Add" to confirm. The app will be added to your home screen and app drawer!</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-sm text-slate-400">
                  <strong className="text-white">💡 Tip:</strong> The installed app will have its own icon and run independently from your browser,
                  giving you quick access to all your memories.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy & Security */}
          <section>
            <h2 className="text-3xl font-bold mb-6">Privacy & Security</h2>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
              <p className="text-slate-300">
                Your privacy and security are our top priorities. Here's how we protect your data:
              </p>

              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span><strong className="text-white">End-to-end encryption:</strong> All your data is encrypted in transit and at rest.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span><strong className="text-white">Privacy controls:</strong> Choose who can see your logs - make them public, followers-only, or completely private.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span><strong className="text-white">No third-party tracking:</strong> We don't sell your data or share it with advertisers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span><strong className="text-white">Data export:</strong> Download all your data anytime in standard formats.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span><strong className="text-white">Account deletion:</strong> Delete your account and all associated data permanently at any time.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Tips & Best Practices */}
          <section>
            <h2 className="text-3xl font-bold mb-6">Tips & Best Practices</h2>
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold mb-2 text-white">📸 Add Photos to Every Log</h3>
                <p className="text-slate-400">
                  Photos make your memories come alive. Try to add at least one photo to each log to create a visual timeline of your year.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold mb-2 text-white">📍 Tag Your Locations</h3>
                <p className="text-slate-400">
                  Adding locations helps you remember where you were and creates beautiful travel statistics. It's also great for trip recaps!
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold mb-2 text-white">✍️ Write Meaningful Captions</h3>
                <p className="text-slate-400">
                  Future you will appreciate the details. Write about how you felt, who you were with, and what made the moment special.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold mb-2 text-white">🔄 Log Regularly</h3>
                <p className="text-slate-400">
                  Make it a habit! Whether it's daily, weekly, or whenever something special happens, consistent logging helps you build a comprehensive record of your life.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold mb-2 text-white">🎉 Check Your Year Recap</h3>
                <p className="text-slate-400">
                  At the end of each year, generate your personalized Year in Review to see your highlights, stats, and most memorable moments.
                </p>
              </div>
            </div>
          </section>

          {/* Support */}
          <section className="pb-12">
            <h2 className="text-3xl font-bold mb-6">Need Help?</h2>
            <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700 text-center">
              <p className="text-slate-300 mb-6">
                Have questions or feedback? We'd love to hear from you!
              </p>
              <button
                onClick={() => navigate('/auth?signup=true')}
                className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Get Started Now
              </button>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-slate-800/50 border-t border-slate-800 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-slate-400 text-sm">
          <p>© 2026 theyear. Built with care for capturing life's moments.</p>
        </div>
      </footer>
    </div>
  );
}
