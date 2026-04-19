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

export default function Feed() {
  const [activeTab, setActiveTab] = useState<Tab>("forYou");
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [globalMuted, setGlobalMuted] = useState(true);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<TmdbMediaItem[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const queries = {
    forYou: useGetTrendingAll(
      { page },
      { query: { enabled: activeTab === "forYou", queryKey: getGetTrendingAllQueryKey({ page }) } }
    ),
    trending: useGetTrendingAll(
      { page },
      { query: { enabled: activeTab === "trending", queryKey: getGetTrendingAllQueryKey({ page }) } }
    ),
    movies: useGetTrendingMovies(
      { page },
      { query: { enabled: activeTab === "movies", queryKey: getGetTrendingMoviesQueryKey({ page }) } }
    ),
    series: useGetTrendingTv(
      { page },
      { query: { enabled: activeTab === "series", queryKey: getGetTrendingTvQueryKey({ page }) } }
    ),
    anime: useGetAnime(
      { page },
      { query: { enabled: activeTab === "anime", queryKey: getGetAnimeQueryKey({ page }) } }
    ),
  };

  const activeQuery = queries[activeTab];
  const rawItems = activeQuery.data?.results || [];

  // merge pages safely
  useEffect(() => {
    if (rawItems.length > 0) {
      setItems((prev) => {
        const merged = [...prev, ...rawItems];
        const unique = Array.from(
          new Map(merged.map((i) => [`${i.id}-${i.media_type}`, i])).values()
        );
        return unique;
      });
    }
  }, [rawItems]);

  // AdSense trigger (safe)
  useEffect(() => {
    try {
      if ((window as any).adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {}
  }, [items]);

  // infinite scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (activeQuery.isFetching) return;

      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 600
      ) {
        setPage((p) => p + 1);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeQuery.isFetching]);

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
      { root: container, threshold: 0.6 }
    );

    cardRefs.current.forEach((el) => observerRef.current?.observe(el));
  }, []);

  useEffect(() => {
    setupObserver();
    return () => observerRef.current?.disconnect();
  }, [items, setupObserver]);

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

  // reset on tab change
  useEffect(() => {
    setPage(1);
    setItems([]);
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
        {activeQuery.isLoading && items.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center snap-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : (
          items.map((item, index) => {
            const showAd = index > 0 && index % 8 === 0;

            return (
              <div key={`${item.id}-${index}`}>
                {showAd && (
                  <div className="h-[100dvh] snap-start flex items-center justify-center bg-black text-white">
                    <div className="w-full max-w-md text-center">
                      <p className="text-xs text-white/50 mb-2">Sponsored</p>

                      <ins
                        className="adsbygoogle"
                        style={{ display: "block" }}
                        data-ad-client="ca-pub-5182890181989860"
                        data-ad-slot="6599749875"
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
        )}

        {activeQuery.isFetching && (
          <div className="w-full py-6 flex justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}