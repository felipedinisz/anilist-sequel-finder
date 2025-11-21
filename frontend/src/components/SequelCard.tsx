import type { Sequel } from '../api/client';
import { Film, Star, Calendar, Tv, Info } from 'lucide-react';
import { useState } from 'react';

interface SequelCardProps {
  sequel: Sequel;
  layout?: 'grid' | 'list' | 'gallery';
}

export const SequelCard = ({ sequel, layout = 'grid' }: SequelCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (layout === 'gallery') {
    return (
      <div 
        className="group relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {sequel.missing_cover ? (
          <img 
            src={sequel.missing_cover} 
            alt={sequel.missing_title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <Film className="w-8 h-8 opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <p className="text-white font-bold text-sm line-clamp-2">{sequel.missing_title}</p>
          {sequel.missing_score && (
            <div className="flex items-center gap-1 text-yellow-400 text-xs mt-1">
              <Star className="w-3 h-3 fill-yellow-400" />
              <span>{sequel.missing_score}%</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="group bg-card rounded-lg border border-gray-800 hover:border-primary/50 transition-all duration-300 flex items-center p-4 gap-4 hover:bg-gray-900/50">
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
        </div>
        
        <div className="flex items-center gap-6 text-sm text-gray-400">
          {sequel.missing_score && (
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium text-gray-200">{sequel.missing_score}%</span>
            </div>
          )}
          {sequel.missing_episodes && (
            <div className="flex items-center gap-1.5">
              <Tv className="w-4 h-4" />
              <span>{sequel.missing_episodes} eps</span>
            </div>
          )}
          {sequel.missing_year && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{sequel.missing_year}</span>
            </div>
          )}
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
      <div className={`${isExpanded ? 'w-full h-48' : 'w-28 h-full'} flex-shrink-0 bg-gray-800 relative overflow-hidden`}>
        {sequel.missing_cover ? (
          <img 
            src={sequel.missing_cover} 
            alt={sequel.missing_title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 group-hover:text-primary/50 transition-colors">
            <Film className="w-8 h-8 opacity-20" />
          </div>
        )}
        <div className="absolute top-0 left-0 bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
          {sequel.format}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0 bg-gradient-to-r from-transparent to-transparent group-hover:to-primary/5 transition-all duration-300">
        <div>
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

          {/* Expanded Info */}
          {isExpanded && (
            <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-4 text-sm text-gray-300">
                {sequel.missing_score && (
                  <div className="flex items-center gap-1.5" title="Average Score">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold">{sequel.missing_score}%</span>
                  </div>
                )}
                {sequel.missing_episodes && (
                  <div className="flex items-center gap-1.5" title="Episodes">
                    <Tv className="w-4 h-4 text-blue-400" />
                    <span>{sequel.missing_episodes} eps</span>
                  </div>
                )}
                {sequel.missing_year && (
                  <div className="flex items-center gap-1.5" title="Release Year">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span>{sequel.missing_year}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 italic">Click card to collapse</p>
            </div>
          )}
        </div>

        {!isExpanded && (
          <div className="flex items-center justify-between mt-auto">
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
              <button className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1.5 rounded transition-colors">
                <Info className="w-4 h-4" />
              </button>
              <a 
                href={`https://anilist.co/anime/${sequel.missing_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-gray-800 hover:bg-primary hover:text-white text-gray-300 px-3 py-1.5 rounded transition-all duration-300 transform active:scale-95"
                onClick={(e) => e.stopPropagation()}
              >
                View
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
