import { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { findSequels } from './api/client';
import { SequelCard } from './components/SequelCard';
import { UserBanner } from './components/UserBanner';
import { Search, Loader2, AlertCircle, Filter, Sparkles, Star } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

function SequelFinder() {
  const [username, setUsername] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [includeUnrated, setIncludeUnrated] = useState(true);
  const [filters, setFilters] = useState({
    TV: true,
    MOVIE: true,
    OVA: true,
    SPECIAL: true,
    ONA: true,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['sequels', searchUser],
    queryFn: () => findSequels(searchUser),
    enabled: !!searchUser,
    retry: false,
  });

  const filteredSequels = useMemo(() => {
    if (!data) return [];
    return data.missing_sequels.filter((sequel) => {
      const format = sequel.format as keyof typeof filters;
      const formatMatch = filters[format] ?? true;
      
      const score = sequel.base_score || 0;
      const isUnrated = !sequel.base_score;
      
      const scoreMatch = isUnrated ? includeUnrated : score >= minScore;
      
      return formatMatch && scoreMatch;
    });
  }, [data, filters, minScore, includeUnrated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setSearchUser(username.trim());
    }
  };

  const toggleFilter = (format: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [format]: !prev[format] }));
  };

  return (
    <div className="min-h-screen bg-[#0B1622] text-gray-100 font-sans selection:bg-primary/30">
      {/* Hero Section with Gradient */}
      <div className="relative bg-gradient-to-b from-blue-900/20 to-transparent pb-12 pt-16 md:pt-24 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4" />
            <span>Discover what you missed</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200 drop-shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            AniList Sequel Finder
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Automatically find missing seasons, movies, and OVAs from your anime list. 
            Never miss a sequel again.
          </p>

          {/* Search Bar */}
          <div className="max-w-lg mx-auto mt-8 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative flex bg-[#151f2e] rounded-xl overflow-hidden shadow-2xl border border-gray-700/50 group-hover:border-gray-600 transition-colors">
                <div className="pl-4 flex items-center justify-center text-gray-500">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Enter your AniList username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-none py-4 px-4 text-lg focus:ring-0 placeholder:text-gray-600 text-white"
                />
                <button
                  type="submit"
                  disabled={isLoading || !username}
                  className="bg-primary hover:bg-blue-500 text-white font-semibold px-8 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 m-1 rounded-lg"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-20">
        {isLoading && (
          <div className="max-w-md mx-auto mt-12 text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <p className="text-xl font-medium text-white">Analyzing Profile...</p>
              <p className="text-gray-400 text-sm mt-1">Fetching <span className="text-primary font-bold">{searchUser}</span>'s anime list</p>
            </div>
            <div className="bg-blue-950/30 border border-blue-900/50 text-blue-200 p-4 rounded-lg text-sm max-w-sm mx-auto">
              <p className="text-blue-300/70 text-xs leading-relaxed">
                We are scanning your Completed and Watching lists to find missing connections. 
                Large lists may take a moment due to API rate limits.
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-8">
          {isError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-6 rounded-xl flex items-center gap-4 max-w-lg mx-auto mt-8 animate-in zoom-in-95 duration-300">
              <div className="bg-red-500/20 p-3 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-red-100">Error Finding Sequels</h3>
                <p className="text-sm text-red-300/80 mt-1">
                  {(error as any)?.response?.data?.detail || (error as Error).message || 'Failed to fetch sequels. Please check the username and try again.'}
                </p>
              </div>
            </div>
          )}

          {data && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* User Banner */}
              <UserBanner user={data.user} missingCount={data.count} />

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-gray-800 pb-6 gap-6 mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-2 whitespace-nowrap">
                  Missing Sequels
                  <span className="text-sm font-normal text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                    {filteredSequels.length}
                  </span>
                </h2>
                
                <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
                  {/* Score Filter */}
                  <div className="flex items-center gap-4 bg-gray-900/50 p-3 rounded-lg border border-gray-800 flex-1 md:flex-none">
                    <div className="flex items-center gap-2 text-gray-400 min-w-[80px]">
                      <Star className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Score</span>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col gap-1 w-full md:w-48">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Min: {minScore}</span>
                          <span>100</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={minScore}
                          onChange={(e) => setMinScore(Number(e.target.value))}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                      
                      <div className="h-8 w-px bg-gray-700 mx-2"></div>
                      
                      <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={includeUnrated}
                          onChange={(e) => setIncludeUnrated(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-600 text-primary focus:ring-primary bg-gray-800"
                        />
                        <span className="text-xs text-gray-300">Include Unrated</span>
                      </label>
                    </div>
                  </div>

                  {/* Format Filters */}
                  <div className="flex flex-wrap items-center gap-2 bg-gray-900/50 p-1.5 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-2 text-gray-400 px-2">
                      <Filter className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Format</span>
                    </div>
                    <div className="h-4 w-px bg-gray-700 mx-1"></div>
                    {(Object.keys(filters) as Array<keyof typeof filters>).map((format) => (
                      <button
                        key={format}
                        onClick={() => toggleFilter(format)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                          filters[format]
                            ? 'bg-primary text-white shadow-lg shadow-blue-900/20'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        {format.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredSequels.length === 0 ? (
                <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800/50 border-dashed">
                  <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    {data.count > 0 
                      ? 'You have missing sequels, but none match your current filters.' 
                      : 'Congratulations! You have watched all available sequels for your anime list.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredSequels.map((sequel) => (
                    <SequelCard key={`${sequel.base_id}-${sequel.missing_id}`} sequel={sequel} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SequelFinder />
    </QueryClientProvider>
  );
}

export default App;
