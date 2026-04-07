import { useGetTrendingAll, getGetTrendingAllQueryKey } from "@workspace/api-client-react";
import { Loader2, TrendingUp, Play } from "lucide-react";
import { Link } from "wouter";

export default function TrendingPage() {
  const { data, isLoading } = useGetTrendingAll({ page: 1 }, { query: { queryKey: getGetTrendingAllQueryKey({ page: 1 }) } });
  
  const items = data?.results || [];

  return (
    <div className="w-full min-h-screen bg-background overflow-y-auto pb-24 md:pb-6 p-4 md:p-8">
      <div className="max-w-6xl mx-auto pt-14 md:pt-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trending Now</h1>
            <p className="text-muted-foreground">What everyone is watching today</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {items.map((item, i) => {
              const poster = item.poster_path ? `https://image.tmdb.org/t/p/w780${item.poster_path}` : null;
              const title = item.title || item.name;
              
              return (
                <div key={item.id} className="group relative rounded-xl overflow-hidden bg-card aspect-[2/3] border border-border/50 hover:border-primary/50 transition-colors">
                  {poster ? (
                    <img src={poster} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground p-4 text-center">
                      No Image
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="font-bold text-white leading-tight mb-1">{title}</h3>
                    <div className="flex items-center gap-2 text-xs text-white/80">
                      <span className="text-primary font-bold">★ {item.vote_average?.toFixed(1)}</span>
                      <span>•</span>
                      <span className="uppercase">{item.media_type}</span>
                    </div>
                    
                    <div className="mt-3 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white mx-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <Play className="w-4 h-4 fill-white ml-1" />
                    </div>
                  </div>
                  
                  {/* Rank Badge */}
                  <div className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center font-bold text-sm text-white">
                    #{i + 1}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
