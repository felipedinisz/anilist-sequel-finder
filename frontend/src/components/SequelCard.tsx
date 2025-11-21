import type { Sequel } from '../api/client';
import { Film, Star, Calendar, Tv } from 'lucide-react';
import { useState } from 'react';

interface SequelCardProps {
  sequel: Sequel;
  layout?: 'grid' | 'list' | 'gallery';
}

export const SequelCard = ({ sequel, layout = 'grid' }: SequelCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  if (layout === 'gallery') {
    return (
      <div 
        className="group relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
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
        
        {/* Gradient Overlay - Always visible at bottom, grows on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
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
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10">
          {sequel.format}
        </div>
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="group bg-card rounded-lg border border-gray-800 hover:border-primary/50 transition-all duration-300 flex items-center p-4 gap-4 hover:bg-gray-900/50">
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
        </div>
      </div>
    );
  }

  // Default Grid Layout
  return (
    <div 
      className={`group bg-card rounded-lg border border-gray-800 hover:border-primary/50 transition-all duration-300 flex overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 ${isExpanded ? 'h-auto flex-col' : 'h-40 flex-row'}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Cover Image */}
      <div className={`${isExpanded ? 'w-full h-64' : 'w-28 h-full'} flex-shrink-0 bg-gray-800 relative overflow-hidden transition-all duration-500`}>
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
        <div className="absolute top-0 left-0 bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
          {sequel.format}
        </div>
        {isExpanded && (
           <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
             <h3 className="text-white font-bold text-lg line-clamp-2">{sequel.missing_title}</h3>
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
            <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 flex items-center gap-1">
              Deep Search
            </span>
          ) : (
            <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded border border-green-400/20">
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
