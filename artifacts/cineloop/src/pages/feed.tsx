import { useState, useRef, useEffect } from "react";
import { 
  useGetTrendingAll, 
  useGetTrendingMovies, 
  useGetTrendingTv, 
  useGetAnime,
  getGetTrendingAllQueryKey,
  getGetTrendingMoviesQueryKey,
  getGetTrendingTvQueryKey,
  getGetAnimeQueryKey,
  TmdbMediaItem
} from "@workspace/api-client-react";
import { FeedCard } from "@/components/feed/feed-card";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Tab = "forYou" | "trending" | "movies" | "series" | "anime";

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<Tab>("forYou");
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const queries = {
    forYou: useGetTrendingAll({ page: 1 }, { query: { enabled: activeTab === "forYou", queryKey: getGetTrendingAllQueryKey({ page: 1 }) } }),
    trending: useGetTrendingAll({ page: 2 }, { query: { enabled: activeTab === "trending", queryKey: getGetTrendingAllQueryKey({ page: 2 }) } }),
    movies: useGetTrendingMovies({ page: 1 }, { query: { enabled: activeTab === "movies", queryKey: getGetTrendingMoviesQueryKey({ page: 1 }) } }),
    series: useGetTrendingTv({ page: 1 }, { query: { enabled: activeTab === "series", queryKey: getGetTrendingTvQueryKey({ page: 1 }) } }),
    anime: useGetAnime({ page: 1 }, { query: { enabled: activeTab === "anime", queryKey: getGetAnimeQueryKey({ page: 1 }) } })
  };

  const activeQuery = queries[activeTab];
  const items = activeQuery.data?.results || [];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const cardHeight = container.clientHeight;
    const scrollTop = container.scrollTop;
    const index = Math.round(scrollTop / cardHeight);
    if (index !== activeCardIndex) {
      setActiveCardIndex(index);
    }
  };

  useEffect(() => {
    setActiveCardIndex(0);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "forYou", label: "For You" },
    { id: "trending", label: "Trending" },
    { id: "movies", label: "Movies" },
    { id: "series", label: "Series" },
    { id: "anime", label: "Anime" }
  ];

  return (
    <div className="relative w-full h-[100dvh] bg-black text-white overflow-hidden">
      
      {/* Top Navigation Overlay */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 md:p-6 pt-16 md:pt-8 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none flex flex-col items-center">
        <div className="flex space-x-6 overflow-x-auto no-scrollbar pointer-events-auto max-w-full px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap pb-2 text-sm md:text-base font-semibold transition-all relative",
                activeTab === tab.id ? "text-white drop-shadow-md" : "text-white/60 hover:text-white/80"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[3px] rounded-full bg-primary shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-[100dvh] overflow-y-scroll snap-y-mandatory no-scrollbar"
      >
        {activeQuery.isLoading ? (
          <div className="w-full h-full flex items-center justify-center snap-center-item">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : items.length > 0 ? (
          items.map((item, index) => (
            <FeedCard 
              key={`${item.id}-${index}`} 
              item={item} 
              isActive={index === activeCardIndex} 
            />
          ))
        ) : null}
      </div>

    </div>
  );
}
