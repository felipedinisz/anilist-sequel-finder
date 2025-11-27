import type { Sequel } from '../api/client';
import { Film, Star, Calendar, Tv, Plus, Check, Loader2, Square, CheckSquare, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { addToList } from '../api/client';

interface SequelCardProps {
  sequel: Sequel;
  layout?: 'grid' | 'list' | 'gallery';
  isOwner?: boolean;
  isSelected?: boolean;
  isIgnored?: boolean;
  isAdded?: boolean;
  onToggleSelect?: () => void;
  onIgnore?: () => void;
  onAdd?: () => void;
}

export const SequelCard = ({ 
  sequel, 
  layout = 'grid', 
  isOwner = false,
  isSelected = false,
  isIgnored = false,
  isAdded: isAddedProp = false,
  onToggleSelect,
  onIgnore,
  onAdd
}: SequelCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(isAddedProp);

  // Sync internal state with prop if needed, but usually prop drives animation
  // We use the prop for the exit animation class

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOwner) return;
    
    setIsAdding(true);
    try {
      await addToList(sequel.missing_id);
      setIsAdded(true);
      onAdd?.();
    } catch (error) {
      console.error("Failed to add to list", error);
    } finally {
      setIsAdding(false);
    }
  };

  // Helper to format next airing date
  const getNextAiring = () => {
    if (!sequel.missing_next_airing) return null;
    const date = new Date(sequel.missing_next_airing.airingAt * 1000);
    return `Ep ${sequel.missing_next_airing.episode}: ${date.toLocaleDateString()}`;
  };

  const statusColor = {
    'RELEASING': 'text-green-400',
    'NOT_YET_RELEASED': 'text-blue-400',
    'FINISHED': 'text-gray-400',
    'CANCELLED': 'text-red-400',
    'HIATUS': 'text-orange-400'
  }[sequel.missing_status || ''] || 'text-gray-400';

  const containerClasses = `
    group bg-card rounded-lg border transition-all duration-500 flex overflow-hidden shadow-sm hover:shadow-xl 
    ${isExpanded ? 'h-auto flex-col' : 'h-40 flex-row'} 
    ${isSelected ? 'border-primary ring-1 ring-primary' : 'border-gray-800 hover:border-primary/50'}
    ${isIgnored ? 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100' : ''}
  `;

  const listContainerClasses = `
    group bg-card rounded-lg border transition-all duration-500 flex items-center p-4 gap-4 hover:bg-gray-900/50
    ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-800 hover:border-primary/50'}
    ${isIgnored ? 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100' : ''}
  `;

  const galleryContainerClasses = `
    group relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1
    ${isIgnored ? 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100' : ''}
  `;

  if (layout === 'gallery') {
    return (
      <div 
        className={galleryContainerClasses}
        onClick={() => setIsExpanded(!isExpanded)}
        title={sequel.missing_title}
      >
        {sequel.missing_cover ? (
          <img 
            src={sequel.missing_cover} 
            alt={sequel.missing_title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <Film className="w-8 h-8 opacity-20" />
          </div>
        )}
        
        {/* Selection Checkbox */}
        {isOwner && onToggleSelect && (
          <div 
            className="absolute top-2 left-2 z-30"
            onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
          >
            <div className={`p-1.5 rounded-md backdrop-blur-md transition-all duration-200 ${
              isSelected 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-black/40 text-gray-400 hover:text-white hover:bg-black/60 border border-white/10'
            }`}>
              {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            </div>
          </div>
        )}

        {/* Format Badge - Moved down slightly if selection is present, or keep it absolute */}
        <div className={`absolute ${isOwner ? 'top-10' : 'top-2'} left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10 transition-all`}>
          {sequel.format}
        </div>

        {/* Gradient Overlay - Always visible at bottom, grows on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          {isOwner && (
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              <button
                onClick={handleAdd}
                disabled={isAdding || isAdded}
                className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg ${
                  isAdded 
                    ? 'bg-green-500 text-white shadow-green-500/20' 
                    : 'bg-black/40 hover:bg-primary text-white border border-white/10'
                }`}
                title={isAdded ? "Added to list" : "Add to list"}
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isAdded ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
              
              {onIgnore && (
                <button
                  onClick={(e) => { e.stopPropagation(); onIgnore(); }}
                  className="p-2 rounded-full backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg bg-black/40 hover:bg-red-500 text-white border border-white/10"
                  title="Ignore this sequel"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <p className="text-white font-bold text-sm line-clamp-2 drop-shadow-md group-hover:line-clamp-none transition-all">
            {sequel.missing_title}
          </p>
          
          <div className="flex items-center gap-2 mt-2 text-xs font-medium">
            {sequel.missing_score ? (
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-3 h-3 fill-yellow-400" />
                <span>{sequel.missing_score}%</span>
              </div>
            ) : (
              <span className="text-gray-400">Score: N/A</span>
            )}
            
            <span className="text-gray-400">•</span>
            
            <span className={statusColor}>
              {sequel.missing_status?.replace(/_/g, ' ') || 'Unknown'}
            </span>
          </div>
        </div>
        
        {/* Format Badge */}
        {/* Removed original Format Badge placement to avoid duplication */}
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className={listContainerClasses}>
        {isOwner && onToggleSelect && (
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
            className={`p-2 rounded-md transition-colors ${isSelected ? 'text-primary' : 'text-gray-600 hover:text-gray-400'}`}
          >
            {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
          </button>
        )}
        <div className="w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-800">
           {sequel.missing_cover && (
             <img src={sequel.missing_cover} alt="" className="w-full h-full object-cover" loading="lazy" />
           )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span className="truncate" title={sequel.base_title}>From: {sequel.base_title}</span>
            {sequel.base_score && (
              <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded text-[10px] font-medium border border-yellow-500/20">
                <Star className="w-3 h-3 fill-yellow-500" />
                {sequel.base_score}
              </span>
            )}
          </div>
          <a 
            href={`https://anilist.co/anime/${sequel.missing_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-bold text-gray-100 group-hover:text-primary truncate block"
          >
            {sequel.missing_title}
          </a>
          
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className={statusColor}>{sequel.missing_status?.replace(/_/g, ' ') || 'Unknown Status'}</span>
            {getNextAiring() && (
              <>
                <span>•</span>
                <span className="text-blue-400">Next: {getNextAiring()}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <div className="flex flex-col items-end gap-1">
            {sequel.missing_score ? (
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-gray-200">{sequel.missing_score}%</span>
              </div>
            ) : (
              <span className="text-xs text-gray-500">No Score</span>
            )}
            <div className="flex items-center gap-2 text-xs">
               <span>{sequel.missing_episodes || '?'} eps</span>
               <span>•</span>
               <span>{sequel.missing_year || 'TBA'}</span>
            </div>
          </div>

          <a 
            href={`https://anilist.co/anime/${sequel.missing_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-800 hover:bg-primary hover:text-white text-gray-300 px-4 py-2 rounded-md transition-colors text-xs font-medium"
          >
            View
          </a>
          {isOwner && (
            <div className="flex items-center gap-2">
              {onIgnore && (
                <button
                  onClick={(e) => { e.stopPropagation(); onIgnore(); }}
                  className="p-2 rounded-md hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                  title="Ignore"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleAdd}
                disabled={isAdding || isAdded}
                className={`px-4 py-2 rounded-md transition-colors text-xs font-medium flex items-center gap-1 ${
                  isAdded 
                    ? 'bg-green-500/20 text-green-400 cursor-default' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {isAdding ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isAdded ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default Grid Layout
  return (
    <div 
      className={containerClasses}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Cover Image */}
      <div className={`${isExpanded ? 'w-full h-64' : 'w-28 h-full'} flex-shrink-0 bg-gray-800 relative overflow-hidden transition-all duration-500`}>
        {isOwner && (
          <>
            {onToggleSelect && (
              <div 
                className="absolute top-2 left-2 z-30"
                onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
              >
                <div className={`p-1 rounded-md backdrop-blur-md transition-all duration-200 ${
                  isSelected 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-black/40 text-gray-400 hover:text-white hover:bg-black/60 border border-white/10'
                }`}>
                  {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                </div>
              </div>
            )}
            
            <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
              <button
                onClick={handleAdd}
                disabled={isAdding || isAdded}
                className={`p-1.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg ${
                  isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                } ${
                  isAdded 
                    ? 'bg-green-500 text-white shadow-green-500/20' 
                    : 'bg-black/60 hover:bg-primary text-white border border-white/10'
                }`}
                title={isAdded ? "Added to list" : "Add to list"}
              >
                {isAdding ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isAdded ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
              </button>

              {onIgnore && (
                <button
                  onClick={(e) => { e.stopPropagation(); onIgnore(); }}
                  className={`p-1.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg bg-black/60 hover:bg-red-500 text-white border border-white/10 ${
                    isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  title="Ignore"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </>
        )}
        {sequel.missing_cover ? (
          <img 
            src={sequel.missing_cover} 
            alt={sequel.missing_title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 group-hover:text-primary/50 transition-colors">
            <Film className="w-8 h-8 opacity-20" />
          </div>
        )}
        <div className={`absolute ${isOwner ? 'top-8' : 'top-0'} left-0 bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm transition-all`}>
          {sequel.format}
        </div>
        {isExpanded && (
           <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
             <h3 className="text-white font-bold text-lg line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{sequel.missing_title}</h3>
           </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0 bg-gradient-to-r from-transparent to-transparent group-hover:to-primary/5 transition-all duration-300">
        <div>
          {!isExpanded && (
            <>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <span className="truncate max-w-[150px]" title={sequel.base_title}>
                  From: {sequel.base_title}
                </span>
                {sequel.base_score && (
                  <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded text-[10px] font-medium border border-yellow-500/20">
                    <Star className="w-3 h-3 fill-yellow-500" />
                    {sequel.base_score}
                  </span>
                )}
              </div>

              <a 
                href={`https://anilist.co/anime/${sequel.missing_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-bold text-gray-100 group-hover:text-primary line-clamp-2 leading-tight mb-2 transition-colors"
                title={sequel.missing_title}
                onClick={(e) => e.stopPropagation()}
              >
                {sequel.missing_title}
              </a>
            </>
          )}

          {/* Expanded Info */}
          {isExpanded ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-gray-500 text-xs">Score</p>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-gray-200">{sequel.missing_score ? `${sequel.missing_score}%` : 'TBA'}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-gray-500 text-xs">Episodes</p>
                  <div className="flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-200">{sequel.missing_episodes || '?'} eps</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-gray-500 text-xs">Year</p>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span className="text-gray-200">{sequel.missing_year || 'TBA'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-gray-500 text-xs">Status</p>
                  <span className={`text-sm font-medium ${statusColor}`}>
                    {sequel.missing_status?.replace(/_/g, ' ') || 'Unknown'}
                  </span>
                </div>
              </div>

              {getNextAiring() && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 text-xs text-blue-300">
                  Next: {getNextAiring()}
                </div>
              )}

              <div className="pt-2 border-t border-gray-800">
                 <p className="text-xs text-gray-500 mb-1">Source:</p>
                 <p className="text-sm text-gray-300 line-clamp-1">{sequel.base_title}</p>
              </div>
            </div>
          ) : (
            // Collapsed Footer
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
               <span>{sequel.missing_year || 'TBA'}</span>
               <span>•</span>
               <span>{sequel.missing_episodes || '?'} eps</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-800/50">
          {sequel.depth > 1 ? (
            <span className="text-[10px] font-medium text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1">
              Deep Search
            </span>
          ) : (
            <span className="text-[10px] font-medium text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded border border-green-400/20">
              Direct Sequel
            </span>
          )}
          
          <div className="flex gap-2">
            <a 
              href={`https://anilist.co/anime/${sequel.missing_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-primary hover:bg-primary/80 text-white px-4 py-1.5 rounded transition-all duration-300 shadow-lg shadow-primary/20"
              onClick={(e) => e.stopPropagation()}
            >
              View on AniList
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
