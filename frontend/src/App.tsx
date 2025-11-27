import { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { findSequels, addToList } from './api/client';
import { SequelCard } from './components/SequelCard';
import { UserBanner } from './components/UserBanner';
import { Toast, type ToastType } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthCallback } from './pages/AuthCallback';
import { Help } from './pages/Help';
import { Search, Loader2, AlertCircle, Filter, Sparkles, Star, LayoutGrid, List, Image as ImageIcon, ArrowUpDown, LogOut, CheckSquare, Square, Plus, X, RefreshCw, HelpCircle } from 'lucide-react';

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
  const { user, login, logout, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [includeUnrated, setIncludeUnrated] = useState(true);
  const [layout, setLayout] = useState<'grid' | 'list' | 'gallery'>('grid');
  const [sortBy, setSortBy] = useState<'score' | 'title' | 'year'>('score');
  const [filters, setFilters] = useState({
    TV: true,
    MOVIE: true,
    OVA: true,
    SPECIAL: true,
    ONA: true,
  });

  // Batch & Ignore State
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [ignoredIds, setIgnoredIds] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('ignored_sequels');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [isBatchAdding, setIsBatchAdding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  const handleRefresh = async () => {
    if (!searchUser) return;
    setIsRefreshing(true);
    try {
      const newData = await findSequels(searchUser, true);
      queryClient.setQueryData(['sequels', searchUser], newData);
      showToast('List refreshed successfully', 'success');
    } catch (error) {
      console.error("Refresh failed", error);
      showToast('Failed to refresh list', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Save ignored IDs to localStorage
  const saveIgnoredIds = (ids: Set<number>) => {
    localStorage.setItem('ignored_sequels', JSON.stringify(Array.from(ids)));
    setIgnoredIds(ids);
  };

  const handleToggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    const visible = filteredSequels.filter(s => !addedIds.has(s.missing_id));
    if (selectedIds.size === visible.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visible.map(s => s.missing_id)));
    }
  };

  const handleIgnore = (id: number) => {
    const newIgnored = new Set(ignoredIds);
    if (newIgnored.has(id)) {
      newIgnored.delete(id);
      showToast('Anime unhidden', 'info');
    } else {
      newIgnored.add(id);
      showToast('Anime hidden from list', 'info');
    }
    saveIgnoredIds(newIgnored);
    
    // Also remove from selection if selected
    if (selectedIds.has(id)) {
      const newSelected = new Set(selectedIds);
      newSelected.delete(id);
      setSelectedIds(newSelected);
    }
  };

  const handleIndividualAdd = (id: number) => {
    setAddedIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
    
    showToast('Anime added to list', 'success');

    // Wait for animation before invalidating
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['sequels'] });
    }, 600);
  };

  const handleBatchAdd = async () => {
    if (selectedIds.size === 0) return;
    
    setIsBatchAdding(true);
    try {
      // Execute sequentially to avoid rate limits if any, or parallel if robust
      // Using Promise.all for now as it's faster and we have rate limiting in backend/client
      const promises = Array.from(selectedIds).map(id => addToList(id));
      await Promise.all(promises);
      
      // Mark as added for animation
      setAddedIds(prev => new Set([...prev, ...selectedIds]));
      
      // Clear selection after success
      const count = selectedIds.size;
      setSelectedIds(new Set());
      
      showToast(`Successfully added ${count} animes to your list!`, 'success');
      
      // Wait for animation before invalidating
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['sequels'] });
        // Optional: clear addedIds after invalidation, though they will be gone from list anyway
      }, 600);
      
    } catch (error) {
      console.error("Batch add failed", error);
      showToast("Some items failed to add. Please try again.", 'error');
    } finally {
      setIsBatchAdding(false);
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['sequels', searchUser],
    queryFn: () => findSequels(searchUser),
    enabled: !!searchUser,
    retry: false,
  });

  const isOwner = isAuthenticated && user?.username?.toLowerCase() === data?.user.name.toLowerCase();

  const filteredSequels = useMemo(() => {
    if (!data) return [];
    let result = data.missing_sequels.filter((sequel) => {
      // We keep ignored items in the list now, but mark them visually
      // if (ignoredIds.has(sequel.missing_id)) return false;

      const format = sequel.format as keyof typeof filters;
      const formatMatch = filters[format] ?? true;
      
      const score = sequel.base_score || 0;
      const isUnrated = !sequel.base_score;
      
      const scoreMatch = isUnrated ? includeUnrated : score >= minScore;
      
      return formatMatch && scoreMatch;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'score') {
        const scoreA = a.missing_score || 0;
        const scoreB = b.missing_score || 0;
        return scoreB - scoreA;
      } else if (sortBy === 'year') {
        const yearA = a.missing_year || 0;
        const yearB = b.missing_year || 0;
        return yearB - yearA;
      } else {
        return a.missing_title.localeCompare(b.missing_title);
      }
    });
  }, [data, filters, minScore, includeUnrated, sortBy]);

  const visibleSequels = filteredSequels.filter(sequel => !addedIds.has(sequel.missing_id));

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
      {/* Navigation Bar */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-end items-center gap-4">
           <a
             href="/help"
             className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5 animate-in fade-in slide-in-from-top-4 duration-700"
           >
             <HelpCircle className="w-5 h-5" />
             <span className="hidden sm:inline font-medium">Need Help?</span>
           </a>

           {/* Auth Button */}
           <div>
             {isAuthenticated ? (
               <div className="flex items-center gap-4 bg-[#151f2e]/80 backdrop-blur-md p-1.5 pr-4 rounded-full border border-gray-700/50 shadow-xl animate-in fade-in slide-in-from-top-4 duration-700">
                 {user?.avatar_url ? (
                   <img src={user.avatar_url} alt={user.username} className="w-9 h-9 rounded-full border-2 border-blue-500/20" />
                 ) : (
                   <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center">
                     <span className="text-blue-400 font-bold">{user?.username?.[0]}</span>
                   </div>
                 )}
                 <div className="flex flex-col hidden md:flex">
                    <span className="text-xs text-gray-400 font-medium leading-none">Welcome back,</span>
                    <span className="text-sm font-bold text-gray-200 leading-none mt-1">{user?.username}</span>
                 </div>
                 <div className="h-8 w-px bg-gray-700/50 mx-2 hidden md:block"></div>
                 <div className="flex flex-col items-end mr-2">
                   <button 
                     onClick={() => { logout(); login(true); }}
                     className="text-[10px] text-gray-500 hover:text-blue-400 underline transition-colors"
                   >
                     Not you?
                   </button>
                 </div>
                 <button 
                   onClick={logout}
                   className="p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-full transition-all"
                   title="Logout"
                 >
                   <LogOut className="w-4 h-4" />
                 </button>
               </div>
             ) : (
               <button
                 onClick={() => login(false)}
                 className="group relative flex items-center gap-3 bg-[#3DB4F2] hover:bg-[#3DB4F2]/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 animate-in fade-in slide-in-from-top-4 duration-700"
               >
                 <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                 <img src="https://anilist.co/img/icons/android-chrome-512x512.png" alt="AniList" className="w-6 h-6" />
                 <span>Login with AniList</span>
               </button>
             )}
           </div>
        </div>
      </nav>

      {/* Hero Section with Gradient */}
      <div className="relative bg-gradient-to-b from-blue-900/20 to-transparent pb-12 pt-32 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4" />
            <span>Discover what you missed</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
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

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Batch Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-[#151f2e] border border-gray-700 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 text-primary px-2 py-0.5 rounded text-sm font-bold">
                {selectedIds.size}
              </div>
              <span className="text-gray-300 font-medium">Selected</span>
            </div>
            
            <div className="h-6 w-px bg-gray-700"></div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                title="Clear Selection"
              >
                <X className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleBatchAdd}
                disabled={isBatchAdding}
                className="bg-primary hover:bg-blue-500 text-white px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBatchAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add to List
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
              <UserBanner user={data.user} missingCount={data.count - addedIds.size} />

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-gray-800 pb-6 gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2 whitespace-nowrap">
                    Missing Sequels
                    <span className="text-sm font-normal text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                      {visibleSequels.length}
                    </span>
                  </h2>
                  
                  {isOwner && visibleSequels.length > 0 && (
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-gray-800"
                    >
                      {selectedIds.size === visibleSequels.length ? (
                        <>
                          <CheckSquare className="w-4 h-4 text-primary" />
                          <span>Deselect All</span>
                        </>
                      ) : (
                        <>
                          <Square className="w-4 h-4" />
                          <span>Select All</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                
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

              {/* View Controls */}
              <div className="flex justify-end gap-4 mb-6">
                <div className="flex items-center gap-2 bg-gray-900/50 p-1 rounded-lg border border-gray-800">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className={`p-2 rounded-md transition-colors ${isRefreshing ? 'text-primary' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    title="Refresh List"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <div className="w-px h-4 bg-gray-700 mx-1"></div>
                  <button
                    onClick={() => setSortBy('score')}
                    className={`p-2 rounded-md transition-colors ${sortBy === 'score' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                    title="Sort by Score"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSortBy('title')}
                    className={`p-2 rounded-md transition-colors ${sortBy === 'title' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                    title="Sort by Title"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-gray-900/50 p-1 rounded-lg border border-gray-800">
                  <button
                    onClick={() => setLayout('grid')}
                    className={`p-2 rounded-md transition-colors ${layout === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setLayout('list')}
                    className={`p-2 rounded-md transition-colors ${layout === 'list' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setLayout('gallery')}
                    className={`p-2 rounded-md transition-colors ${layout === 'gallery' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                    title="Gallery View"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {visibleSequels.length === 0 ? (
                <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800/50 border-dashed">
                  <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    {data.count > 0 && filteredSequels.length > 0
                      ? 'Great job! You have added all the sequels from this list.'
                      : data.count > 0 
                        ? 'You have missing sequels, but none match your current filters.' 
                        : 'Congratulations! You have watched all available sequels for your anime list.'}
                  </p>
                </div>
              ) : (
                <motion.div 
                  layout
                  className={`
                    ${layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : ''}
                    ${layout === 'list' ? 'flex flex-col gap-3' : ''}
                    ${layout === 'gallery' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4' : ''}
                  `}
                >
                  <AnimatePresence mode="popLayout">
                    {visibleSequels.map((sequel) => (
                        <motion.div
                          key={`${sequel.base_id}-${sequel.missing_id}`}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                          transition={{ duration: 0.2 }}
                        >
                          <SequelCard 
                            sequel={sequel} 
                            layout={layout}
                            isOwner={isOwner}
                            isSelected={selectedIds.has(sequel.missing_id)}
                            isIgnored={ignoredIds.has(sequel.missing_id)}
                            isAdded={addedIds.has(sequel.missing_id)}
                            onToggleSelect={() => handleToggleSelect(sequel.missing_id)}
                            onIgnore={() => handleIgnore(sequel.missing_id)}
                            onAdd={() => handleIndividualAdd(sequel.missing_id)}
                          />
                        </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  // Simple routing for callback
  if (window.location.pathname === '/auth/callback') {
    return (
      <AuthProvider>
        <AuthCallback />
      </AuthProvider>
    );
  }

  if (window.location.pathname === '/help') {
    return <Help />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SequelFinder />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
