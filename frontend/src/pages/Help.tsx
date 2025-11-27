import { ArrowLeft, BookOpen, CheckCircle, Filter, Search, Sparkles } from 'lucide-react';

export const Help = () => {
  return (
    <div className="min-h-screen bg-[#0B1622] text-gray-300 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#151f2e]/80 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center h-16">
            {/* Left: Back Button */}
            <div className="flex-shrink-0 z-10">
              <a href="/" className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Back to App</span>
              </a>
            </div>

            {/* Center: Title (Absolutely centered) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-base sm:text-xl text-white tracking-tight">AniList Sequel Finder</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            How to use <span className="text-blue-400">Sequel Finder</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover missing seasons, movies, and OVAs from your anime list automatically. Never miss a continuation again.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-[#151f2e] p-6 rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-colors">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 text-blue-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">1. Find Your Profile</h3>
            <p className="text-gray-400">
              Enter your AniList username to search publicly, or <strong>Login</strong> to access your private lists and enable one-click updates.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#151f2e] p-6 rounded-2xl border border-gray-800 hover:border-purple-500/30 transition-colors">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 text-purple-400">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">2. Filter Results</h3>
            <p className="text-gray-400">
              We analyze your <strong>Completed</strong> list and find related anime you haven't watched yet. Filter by format (TV, Movie, OVA) to find exactly what you want.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#151f2e] p-6 rounded-2xl border border-gray-800 hover:border-green-500/30 transition-colors">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 text-green-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">3. Add to List</h3>
            <p className="text-gray-400">
              Found something interesting? Add it to your <strong>Planning</strong> list directly from the app (requires login).
            </p>
          </div>
        </div>

        {/* FAQ / Details Section */}
        <div className="space-y-8 bg-[#151f2e]/50 p-8 rounded-3xl border border-gray-800/50">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <details className="group bg-[#0B1622] rounded-xl border border-gray-800 open:border-blue-500/30 transition-all">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-white">
                <span>Why do I need to login?</span>
                <span className="transform group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 leading-relaxed">
                Login is optional! You can use the search bar to find sequels for any public profile. However, logging in allows you to:
                <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                  <li>Add anime to your list directly</li>
                  <li>Access your private lists</li>
                  <li>Sync your progress automatically</li>
                </ul>
              </div>
            </details>

            <details className="group bg-[#0B1622] rounded-xl border border-gray-800 open:border-blue-500/30 transition-all">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-white">
                <span>How does it find sequels?</span>
                <span className="transform group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 leading-relaxed">
                We scan your "Completed" list on AniList and look at the relations graph for each anime. If a direct sequel, prequel, or side story exists and isn't in your list (Completed, Watching, or Dropped), we show it to you.
              </div>
            </details>

            <details className="group bg-[#0B1622] rounded-xl border border-gray-800 open:border-blue-500/30 transition-all">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-white">
                <span>Is my data safe?</span>
                <span className="transform group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 leading-relaxed">
                Yes. We use AniList's official API for authentication. We never see your password. Your token is stored locally on your device and used only to communicate with AniList.
              </div>
            </details>

            <details className="group bg-[#0B1622] rounded-xl border border-gray-800 open:border-blue-500/30 transition-all">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-white">
                <span>I can't switch accounts / Auto-login issue</span>
                <span className="transform group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 leading-relaxed">
                <p className="mb-2">
                  If you try to switch accounts but the app automatically logs you back into the same one, this is due to how AniList handles sessions.
                </p>
                <p>
                  To fix this, please go to <a href="https://anilist.co" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">anilist.co</a>, <strong>log out manually</strong> there, and then try logging in again here.
                </p>
              </div>
            </details>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center py-8">
          <a 
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1"
          >
            <Sparkles className="w-5 h-5" />
            Start Finding Sequels
          </a>
        </div>

      </main>
    </div>
  );
};
