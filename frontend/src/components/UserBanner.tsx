import type { UserProfile } from '../api/client';
import { Clock, PlayCircle, Tv } from 'lucide-react';

interface UserBannerProps {
  user: UserProfile;
  missingCount: number;
}

export const UserBanner = ({ user, missingCount }: UserBannerProps) => {
  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-gray-800 shadow-2xl mb-8 group">
      {/* Banner Image */}
      <div className="h-48 w-full relative">
        {user.bannerImage ? (
          <img 
            src={user.bannerImage} 
            alt="Profile Banner" 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 to-purple-900 opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col md:flex-row items-end md:items-center gap-6">
        {/* Avatar */}
        <div className="relative -mb-12 md:mb-0 flex-shrink-0">
          <img 
            src={user.avatar.large} 
            alt={user.name} 
            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-gray-900 shadow-lg transform group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 mb-2 md:mb-0">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            {user.name}
            <a 
              href={`https://anilist.co/user/${user.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-2 py-1 rounded border border-blue-500/30 transition-colors"
            >
              View Profile
            </a>
          </h2>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-1.5 rounded-full backdrop-blur-sm border border-gray-700">
              <Tv className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-white">{user.statistics.anime.count}</span> Anime
            </div>
            <div className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-1.5 rounded-full backdrop-blur-sm border border-gray-700">
              <PlayCircle className="w-4 h-4 text-green-400" />
              <span className="font-semibold text-white">{user.statistics.anime.episodesWatched}</span> Episodes
            </div>
            <div className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-1.5 rounded-full backdrop-blur-sm border border-gray-700">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-white">{Math.round(user.statistics.anime.minutesWatched / 60 / 24)}</span> Days Watched
            </div>
          </div>
        </div>

        {/* Result Stat */}
        <div className="bg-gray-800/80 backdrop-blur-md p-4 rounded-lg border border-gray-700 text-center min-w-[140px] shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
          <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Missing Sequels</div>
          <div className="text-3xl font-bold text-primary">{missingCount}</div>
        </div>
      </div>
    </div>
  );
};