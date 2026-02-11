import { Link } from 'react-router-dom';
import { ArrowLeft, Share2, MoreVertical } from 'lucide-react';

export default function Docs() {

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/[0.08]">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[15px] font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <img src="/lgofc.png" alt="theyear" className="w-7 h-7" />
            <h1 className="text-[17px] font-semibold tracking-tight">theyear</h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <div className="mb-20">
          <h1 className="text-5xl lg:text-6xl font-display font-normal mb-6 leading-[1.1] tracking-tight">Documentation</h1>
          <p className="text-lg text-white/70 leading-relaxed">Everything you need to know about theyear</p>
        </div>

        <div className="space-y-24">
          <section>
            <h2 className="text-4xl font-display font-normal mb-8 tracking-tight leading-[1.1]">About theyear</h2>
            <div className="space-y-6 text-base text-white/80 leading-relaxed max-w-3xl">
              <p>
                theyear is a modern digital journal that helps you document and cherish every moment of your year.
                It's designed to make logging your daily experiences effortless while providing beautiful insights into your life over time.
              </p>
              <p>
                Whether you're traveling the world, building new habits, or simply want to remember the little moments that make life special,
                theyear gives you the tools to capture, organize, and reflect on your experiences.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-4xl font-display font-normal mb-12 tracking-tight leading-[1.1]">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
              <div className="border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
                <h3 className="text-2xl font-semibold mb-3 tracking-tight">Quick Logging</h3>
                <p className="text-white/70 leading-relaxed text-[15px]">
                  Capture moments in seconds with our streamlined quick log feature. Add photos, locations, and notes instantly.
                </p>
              </div>

              <div className="border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
                <h3 className="text-2xl font-semibold mb-3 tracking-tight">Location Tracking</h3>
                <p className="text-white/70 leading-relaxed text-[15px]">
                  Automatically save locations with your logs. See everywhere you've been on an interactive map and track your travels.
                </p>
              </div>

              <div className="border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
                <h3 className="text-2xl font-semibold mb-3 tracking-tight">Social Features</h3>
                <p className="text-white/70 leading-relaxed text-[15px]">
                  Follow friends, like and comment on logs, and share your experiences. Keep your logs private or share with the world.
                </p>
              </div>

              <div className="border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
                <h3 className="text-2xl font-semibold mb-3 tracking-tight">Year in Review</h3>
                <p className="text-white/70 leading-relaxed text-[15px]">
                  Get a beautiful recap of your year with stats, photos, and highlights. Share your journey with friends and family.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-4xl font-display font-normal mb-12 tracking-tight leading-[1.1]">Getting Started</h2>
            <div className="space-y-8 max-w-3xl">
              <div className="border-l-2 border-white/20 pl-8">
                <div className="text-sm text-white/40 mb-2 font-medium tracking-wider uppercase">Step 1</div>
                <h3 className="text-2xl font-semibold mb-3 tracking-tight">Create Your Account</h3>
                <p className="text-white/70 leading-relaxed text-[15px]">
                  Sign up with your email address. It's quick, free, and secure. Your data is protected with industry-standard encryption.
                </p>
              </div>

              <div className="border-l-2 border-white/20 pl-8">
                <div className="text-sm text-white/40 mb-2 font-medium tracking-wider uppercase">Step 2</div>
                <h3 className="text-2xl font-semibold mb-3 tracking-tight">Set Up Your Profile</h3>
                <p className="text-white/70 leading-relaxed text-[15px]">
                  Choose a username, add a bio, and upload a profile picture. Customize your privacy settings to control who can see your logs.
                </p>
              </div>

              <div className="border-l-2 border-white/20 pl-8">
                <div className="text-sm text-white/40 mb-2 font-medium tracking-wider uppercase">Step 3</div>
                <h3 className="text-2xl font-semibold mb-3 tracking-tight">Create Your First Log</h3>
                <p className="text-white/70 leading-relaxed text-[15px]">
                  Click the "+" button to create your first log. Add a photo, write about your day, tag the location, and save your memory.
                </p>
              </div>

              <div className="border-l-2 border-white/20 pl-8">
                <div className="text-sm text-white/40 mb-2 font-medium tracking-wider uppercase">Step 4</div>
                <h3 className="text-2xl font-semibold mb-3 tracking-tight">Add to Home Screen</h3>
                <p className="text-white/70 leading-relaxed text-[15px]">
                  For the best experience, install theyear on your phone's home screen. See instructions below for your device.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-4xl font-display font-normal mb-12 tracking-tight leading-[1.1]">Add to Home Screen (iOS)</h2>
            <div className="border border-white/10 rounded-2xl p-8 lg:p-12 space-y-8">
              <p className="text-white/80 leading-relaxed text-base">
                Install theyear as a Progressive Web App (PWA) on your iPhone or iPad for the best experience:
              </p>

              <div className="space-y-8">
                <div className="border-l-2 border-white/20 pl-6">
                  <div className="text-sm text-white/40 mb-2 font-medium">Step 1</div>
                  <h4 className="font-semibold text-white mb-2 text-lg">Open Safari</h4>
                  <p className="text-white/70 text-[15px] leading-relaxed">Navigate to theyear.app in the Safari browser (this won't work in Chrome or other browsers on iOS).</p>
                </div>

                <div className="border-l-2 border-white/20 pl-6">
                  <div className="text-sm text-white/40 mb-2 font-medium">Step 2</div>
                  <h4 className="font-semibold text-white mb-2 text-lg flex items-center gap-2">
                    Tap the Share Button
                    <Share2 className="w-4 h-4 text-white/40" />
                  </h4>
                  <p className="text-white/70 text-[15px] leading-relaxed">Look for the share icon at the bottom of your screen (a square with an arrow pointing up).</p>
                </div>

                <div className="border-l-2 border-white/20 pl-6">
                  <div className="text-sm text-white/40 mb-2 font-medium">Step 3</div>
                  <h4 className="font-semibold text-white mb-2 text-lg">Scroll and Select "Add to Home Screen"</h4>
                  <p className="text-white/70 text-[15px] leading-relaxed">In the share menu, scroll down until you see "Add to Home Screen" with a plus icon.</p>
                </div>

                <div className="border-l-2 border-white/20 pl-6">
                  <div className="text-sm text-white/40 mb-2 font-medium">Step 4</div>
                  <h4 className="font-semibold text-white mb-2 text-lg">Confirm Installation</h4>
                  <p className="text-white/70 text-[15px] leading-relaxed">Tap "Add" in the top right corner. The theyear icon will appear on your home screen!</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                <p className="text-sm text-white/70 leading-relaxed">
                  Once installed, theyear will work just like a native app with offline support,
                  push notifications, and a full-screen experience.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-4xl font-display font-normal mb-12 tracking-tight leading-[1.1]">Add to Home Screen (Android)</h2>
            <div className="border border-white/10 rounded-2xl p-8 lg:p-12 space-y-8">
              <p className="text-white/80 leading-relaxed text-base">
                Install theyear on your Android device using Chrome or any Chromium-based browser:
              </p>

              <div className="space-y-8">
                <div className="border-l-2 border-white/20 pl-6">
                  <div className="text-sm text-white/40 mb-2 font-medium">Step 1</div>
                  <h4 className="font-semibold text-white mb-2 text-lg">Open Chrome</h4>
                  <p className="text-white/70 text-[15px] leading-relaxed">Navigate to theyear.app in the Chrome browser (or Edge, Samsung Internet, Firefox, etc.).</p>
                </div>

                <div className="border-l-2 border-white/20 pl-6">
                  <div className="text-sm text-white/40 mb-2 font-medium">Step 2</div>
                  <h4 className="font-semibold text-white mb-2 text-lg flex items-center gap-2">
                    Tap the Menu Button
                    <MoreVertical className="w-4 h-4 text-white/40" />
                  </h4>
                  <p className="text-white/70 text-[15px] leading-relaxed">Look for the three dots in the top right corner of your browser.</p>
                </div>

                <div className="border-l-2 border-white/20 pl-6">
                  <div className="text-sm text-white/40 mb-2 font-medium">Step 3</div>
                  <h4 className="font-semibold text-white mb-2 text-lg">
                    Select "Add to Home Screen" or "Install App"
                  </h4>
                  <p className="text-white/70 text-[15px] leading-relaxed">You might also see a banner at the bottom of the screen prompting you to install.</p>
                </div>

                <div className="border-l-2 border-white/20 pl-6">
                  <div className="text-sm text-white/40 mb-2 font-medium">Step 4</div>
                  <h4 className="font-semibold text-white mb-2 text-lg">Confirm Installation</h4>
                  <p className="text-white/70 text-[15px] leading-relaxed">Tap "Install" or "Add" to confirm. The app will be added to your home screen and app drawer!</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                <p className="text-sm text-white/70 leading-relaxed">
                  The installed app will have its own icon and run independently from your browser,
                  giving you quick access to all your memories.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-4xl font-display font-normal mb-12 tracking-tight leading-[1.1]">Privacy & Security</h2>
            <div className="border border-white/10 rounded-2xl p-8 lg:p-12 space-y-6">
              <p className="text-white/80 leading-relaxed text-base mb-6">
                Your privacy and security are our top priorities. Here's how we protect your data:
              </p>

              <div className="space-y-5 text-white/70 text-[15px]">
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-white">End-to-end encryption:</strong> All your data is encrypted in transit and at rest.
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-white">Privacy controls:</strong> Choose who can see your logs - make them public, followers-only, or completely private.
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-white">No third-party tracking:</strong> We don't sell your data or share it with advertisers.
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-white">Data export:</strong> Download all your data anytime in standard formats.
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-white">Account deletion:</strong> Delete your account and all associated data permanently at any time.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-4xl font-display font-normal mb-12 tracking-tight leading-[1.1]">Tips & Best Practices</h2>
            <div className="space-y-6 max-w-3xl">
              <div className="border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-white tracking-tight">Add Photos to Every Log</h3>
                <p className="text-white/70 text-[15px] leading-relaxed">
                  Photos make your memories come alive. Try to add at least one photo to each log to create a visual timeline of your year.
                </p>
              </div>

              <div className="border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-white tracking-tight">Tag Your Locations</h3>
                <p className="text-white/70 text-[15px] leading-relaxed">
                  Adding locations helps you remember where you were and creates beautiful travel statistics. It's also great for trip recaps!
                </p>
              </div>

              <div className="border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-white tracking-tight">Write Meaningful Captions</h3>
                <p className="text-white/70 text-[15px] leading-relaxed">
                  Future you will appreciate the details. Write about how you felt, who you were with, and what made the moment special.
                </p>
              </div>

              <div className="border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-white tracking-tight">Log Regularly</h3>
                <p className="text-white/70 text-[15px] leading-relaxed">
                  Make it a habit! Whether it's daily, weekly, or whenever something special happens, consistent logging helps you build a comprehensive record of your life.
                </p>
              </div>

              <div className="border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-white tracking-tight">Check Your Year Recap</h3>
                <p className="text-white/70 text-[15px] leading-relaxed">
                  At the end of each year, generate your personalized Year in Review to see your highlights, stats, and most memorable moments.
                </p>
              </div>
            </div>
          </section>

          <section className="pb-16">
            <div className="border border-white/10 rounded-2xl p-12 text-center">
              <h2 className="text-3xl font-display font-normal mb-4 tracking-tight leading-[1.1]">Ready to get started?</h2>
              <p className="text-white/70 mb-8 text-[15px]">
                Begin documenting your year today.
              </p>
              <Link
                to="/auth?signup=true"
                className="px-8 py-4 bg-white text-black text-[15px] font-medium rounded-lg hover:bg-gray-100 transition-all inline-flex items-center gap-2"
              >
                Get Started Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/[0.08] py-16 bg-black">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center text-[14px] text-white/50">
          <p>&copy; 2026 theyear. Document your year with intention.</p>
        </div>
      </footer>
    </div>
  );
}
