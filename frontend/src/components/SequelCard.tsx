import type { Sequel } from '../api/client';
import { Film, Star } from 'lucide-react';

interface SequelCardProps {
  sequel: Sequel;
}

export const SequelCard = ({ sequel }: SequelCardProps) => {
  return (
    <div className="group bg-card rounded-lg border border-gray-800 hover:border-primary/50 transition-all duration-300 flex overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 h-40">
      {/* Cover Image */}
      <div className="w-28 flex-shrink-0 bg-gray-800 relative overflow-hidden">
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
          >
            {sequel.missing_title}
          </a>
        </div>

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
          
          <a 
            href={`https://anilist.co/anime/${sequel.missing_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-gray-800 hover:bg-primary hover:text-white text-gray-300 px-3 py-1.5 rounded transition-all duration-300 transform active:scale-95"
          >
            View on AniList
          </a>
        </div>
      </div>
    </div>
  );
};
