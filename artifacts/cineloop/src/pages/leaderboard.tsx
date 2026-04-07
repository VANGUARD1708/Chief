import { useGetTrendingMovies, getGetTrendingMoviesQueryKey } from "@workspace/api-client-react";
import { Trophy, Star, Loader2 } from "lucide-react";

export default function LeaderboardPage() {
  const { data, isLoading } = useGetTrendingMovies({ page: 1 }, { query: { queryKey: getGetTrendingMoviesQueryKey({ page: 1 }) } });
  
  // Sort by rating for the leaderboard
  const items = data?.results ? [...data.results].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0)) : [];

  return (
    <div className="w-full min-h-screen bg-background overflow-y-auto pb-24 md:pb-6 p-4 md:p-8">
      <div className="max-w-4xl mx-auto pt-14 md:pt-4">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
            <p className="text-muted-foreground">Highest rated trending movies</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => {
              const poster = item.poster_path ? `https://image.tmdb.org/t/p/w780${item.poster_path}` : null;
              const title = item.title || item.name;
              const rating = item.vote_average?.toFixed(1);
              const votes = item.vote_count;
              
              return (
                <div key={item.id} className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors">
                  
                  {/* Rank */}
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center font-bold text-xl">
                    {index === 0 ? (
                      <span className="text-yellow-500 text-3xl drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">1</span>
                    ) : index === 1 ? (
                      <span className="text-gray-300 text-2xl">2</span>
                    ) : index === 2 ? (
                      <span className="text-amber-700 text-2xl">3</span>
                    ) : (
                      <span className="text-muted-foreground">{index + 1}</span>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div className="w-16 h-24 shrink-0 rounded-md overflow-hidden bg-muted">
                    {poster && <img src={poster} alt={title} className="w-full h-full object-cover" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 py-2">
                    <h3 className="font-bold text-lg text-foreground truncate">{title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{item.overview}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded text-sm font-bold border border-primary/20">
                        <Star className="w-4 h-4 fill-primary" />
                        {rating}
                      </div>
                      <span className="text-xs text-muted-foreground">{votes} votes</span>
                    </div>
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
