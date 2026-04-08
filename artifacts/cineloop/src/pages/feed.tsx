import { useState, useRef, useEffect, useCallback } from "react";
import {
  useGetTrendingAll,
  useGetTrendingMovies,
  useGetTrendingTv,
  useGetAnime,
  getGetTrendingAllQueryKey,
  getGetTrendingMoviesQueryKey,
  getGetTrendingTvQueryKey,
  getGetAnimeQueryKey,
  TmdbMediaItem,
} from "@workspace/api-client-react";
import { FeedCard } from "@/components/feed/feed-card";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Tab = "forYou" | "trending" | "movies" | "series" | "anime";

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<Tab>("forYou");
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [globalMuted, setGlobalMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const queries = {
    forYou: useGetTrendingAll(
      { page: 1 },
      { query: { enabled: activeTab === "forYou", queryKey: getGetTrendingAllQueryKey({ page: 1 }) } }
    ),
    trending: useGetTrendingAll(
      { page: 2 },
      { query: { enabled: activeTab === "trending", queryKey: getGetTrendingAllQueryKey({ page: 2 }) } }
    ),
    movies: useGetTrendingMovies(
      { page: 1 },
      { query: { enabled: activeTab === "movies", queryKey: getGetTrendingMoviesQueryKey({ page: 1 }) } }
    ),
    series: useGetTrendingTv(
      { page: 1 },
      { query: { enabled: activeTab === "series", queryKey: getGetTrendingTvQueryKey({ page: 1 }) } }
    ),
    anime: useGetAnime(
      { page: 1 },
      { query: { enabled: activeTab === "anime", queryKey: getGetAnimeQueryKey({ page: 1 }) } }
    ),
  };

  const activeQuery = queries[activeTab];
  const rawItems = activeQuery.data?.results || [];

  const setupObserver = useCallback(() => {
    observerRef.current?.disconnect();

    const container = containerRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!isNaN(idx)) setActiveCardIndex(idx);
          }
        });
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    cardRefs.current.forEach((el) => {
      observerRef.current?.observe(el);
    });
  }, []);

  useEffect(() => {
    setupObserver();
    return () => observerRef.current?.disconnect();
  }, [rawItems, setupObserver]);

  const setCardRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      if (el) {
        el.dataset.index = String(index);
        cardRefs.current.set(index, el);
        observerRef.current?.observe(el);
      } else {
        cardRefs.current.delete(index);
      }
    },
    []
  );

  useEffect(() => {
    setActiveCardIndex(0);
    cardRefs.current.clear();
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [activeTab]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "forYou", label: "For You" },
    { id: "trending", label: "Trending" },
    { id: "movies", label: "Movies" },
    { id: "series", label: "Series" },
    { id: "anime", label: "Anime" },
  ];

  return (
    <div className="relative w-full h-[100dvh] bg-black text-white overflow-hidden">

      {/* Tabs */}
      <div className="absolute top-0 left-0 right-0 z-40 pt-16 md:pt-8 pb-3 px-4 md:px-6 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none flex flex-col items-center">
        <div className="flex space-x-6 overflow-x-auto no-scrollbar pointer-events-auto max-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap pb-2 text-sm md:text-base font-semibold transition-all relative",
                activeTab === tab.id
                  ? "text-white drop-shadow-md"
                  : "text-white/55 hover:text-white/80"
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

      {/* Feed */}
      <div
        ref={containerRef}
        className="w-full h-[100dvh] overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
        {activeQuery.isLoading ? (
          <div className="w-full h-full flex items-center justify-center snap-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : rawItems.length > 0 ? (
          rawItems.map((item: TmdbMediaItem, index: number) => {
            const showAd = index > 0 && index % 5 === 0;

            return (
              <div key={`${item.id}-${index}`}>
                {showAd && (
                  <div className="h-[100dvh] snap-start flex items-center justify-center bg-black text-white">
                    <div className="w-full max-w-md text-center">
                      <p className="text-xs text-white/50 mb-2">Sponsored</p>

                      {/* Google AdSense slot */}
                      <ins
                        className="adsbygoogle"
                        style={{ display: "block", width: "100%", height: "300px" }}
                        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                        data-ad-slot="XXXXXXXXXX"
                        data-ad-format="auto"
                        data-full-width-responsive="true"
                      />
                    </div>
                  </div>
                )}

                <div ref={setCardRef(index)}>
                  <FeedCard
                    item={item}
                    isActive={index === activeCardIndex}
                    isMuted={globalMuted}
                    onMuteToggle={() => setGlobalMuted((prev) => !prev)}
                  />
                </div>
              </div>
            );
          })
        ) : null}
      </div>
    </div>
  );
}