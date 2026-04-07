import { useEffect, useRef, useState } from "react";
import { TmdbMediaItem, useGetTmdbVideos, GetTmdbVideosType, getGetTmdbVideosQueryKey } from "@workspace/api-client-react";
import { Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX, Play, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserData } from "@/hooks/use-user-data";

interface FeedCardProps {
  item: TmdbMediaItem;
  isActive: boolean;
}

export function FeedCard({ item, isActive }: FeedCardProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const { isLiked, isSaved, toggleLike, toggleSave } = useUserData();

  const isMovie = item.media_type !== "tv";
  const mediaType = isMovie ? GetTmdbVideosType.movie : GetTmdbVideosType.tv;
  
  const { data: videos } = useGetTmdbVideos({ id: item.id, type: mediaType }, {
    query: {
      enabled: isActive,
      queryKey: getGetTmdbVideosQueryKey({ id: item.id, type: mediaType })
    }
  });

  const trailer = videos?.results?.find((v) => v.type === "Trailer" && v.site === "YouTube") || videos?.results?.[0];

  const title = item.title || item.name || item.original_title || item.original_name;
  const year = (item.release_date || item.first_air_date)?.substring(0, 4);
  const rating = item.vote_average?.toFixed(1);

  const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/original${item.poster_path}` : null;
  const backdropUrl = item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : posterUrl;

  const handleDoubleTap = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLiked(item.id)) {
      toggleLike(item);
    }
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 1000);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative w-full h-[100dvh] snap-center-item bg-black flex items-center justify-center overflow-hidden">
      
      {/* Background / Video Layer */}
      <div className="absolute inset-0 w-full h-full" onDoubleClick={handleDoubleTap} onClick={togglePlay}>
        {isActive && trailer && isPlaying ? (
          <div className="w-full h-full relative pointer-events-none">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&loop=1&playsinline=1&playlist=${trailer.key}`}
              allow="autoplay; encrypted-media"
              className="absolute top-1/2 left-1/2 w-[300vw] h-[300vh] -translate-x-1/2 -translate-y-1/2 md:w-[100vw] md:h-[100vh] object-cover scale-[1.3] opacity-80"
            />
          </div>
        ) : (
          <div className="w-full h-full relative">
            {backdropUrl && (
              <img 
                src={backdropUrl} 
                alt={title} 
                className="w-full h-full object-cover opacity-60" 
              />
            )}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          </div>
        )}
      </div>

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-black/20">
          <Play className="w-20 h-20 text-white/80 fill-white" />
        </div>
      )}

      {/* Heart Burst Animation */}
      {showHeartBurst && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <Heart className="w-32 h-32 text-primary fill-primary animate-in zoom-in duration-300 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
        </div>
      )}

      {/* Gradient Overlays */}
      <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 left-0 right-0 h-[20vh] bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />

      {/* Content Layer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-24 md:pb-8 z-20 flex items-end justify-between pointer-events-none">
        
        {/* Info Area */}
        <div className="flex-1 pr-16 pointer-events-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight drop-shadow-lg">{title}</h2>
          <div className="flex items-center gap-3 text-sm text-white/80 mb-3 font-medium">
            {year && <span>{year}</span>}
            {rating && (
              <span className="flex items-center gap-1 text-primary">
                ★ {rating}
              </span>
            )}
            <span className="border border-white/20 px-2 py-0.5 rounded text-xs">
              {isMovie ? 'MOVIE' : 'SERIES'}
            </span>
          </div>
          <p className="text-white/70 text-sm md:text-base line-clamp-3 md:line-clamp-4 max-w-2xl drop-shadow-md">
            {item.overview}
          </p>
        </div>

        {/* Right Action Bar */}
        <div className="absolute right-4 bottom-24 md:bottom-8 flex flex-col items-center gap-6 pointer-events-auto">
          <button 
            onClick={() => toggleLike(item)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={cn("p-3 rounded-full bg-black/40 backdrop-blur-md transition-all group-active:scale-90", isLiked(item.id) && "bg-primary/20")}>
              <Heart className={cn("w-7 h-7", isLiked(item.id) ? "text-primary fill-primary" : "text-white")} />
            </div>
            <span className="text-xs text-white/90 font-medium">{item.vote_count ? (item.vote_count / 1000).toFixed(1) + 'K' : 'Like'}</span>
          </button>

          <button 
            onClick={() => toggleSave(item)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={cn("p-3 rounded-full bg-black/40 backdrop-blur-md transition-all group-active:scale-90", isSaved(item.id) && "bg-white/20")}>
              <Bookmark className={cn("w-7 h-7", isSaved(item.id) ? "text-white fill-white" : "text-white")} />
            </div>
            <span className="text-xs text-white/90 font-medium">Save</span>
          </button>

          <button className="flex flex-col items-center gap-1 group">
            <div className="p-3 rounded-full bg-black/40 backdrop-blur-md transition-all group-active:scale-90">
              <Share2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs text-white/90 font-medium">Share</span>
          </button>

          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 rounded-full bg-black/40 backdrop-blur-md mt-4 transition-all active:scale-90"
          >
            {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}
