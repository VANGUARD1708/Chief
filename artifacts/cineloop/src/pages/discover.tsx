import { useState } from "react";
import { useGetTmdbGenres, useDiscoverTmdb, GetTmdbGenresType, DiscoverTmdbType, getGetTmdbGenresQueryKey, getDiscoverTmdbQueryKey } from "@workspace/api-client-react";
import { Compass, Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DiscoverPage() {
  const [type, setType] = useState<GetTmdbGenresType>(GetTmdbGenresType.movie);
  const [selectedGenre, setSelectedGenre] = useState<number | undefined>(undefined);

  const { data: genresData } = useGetTmdbGenres({ type }, { query: { queryKey: getGetTmdbGenresQueryKey({ type }) } });
  const { data: discoverData, isLoading } = useDiscoverTmdb(
    { type: type as DiscoverTmdbType, genre: selectedGenre, page: 1 }, 
    { query: { queryKey: getDiscoverTmdbQueryKey({ type: type as DiscoverTmdbType, genre: selectedGenre, page: 1 }) } }
  );

  const genres = genresData?.genres || [];
  const items = discoverData?.results || [];

  return (
    <div className="w-full min-h-screen bg-background overflow-y-auto pb-24 md:pb-6 p-4 md:p-8 flex flex-col">
      <div className="max-w-6xl mx-auto pt-14 md:pt-4 w-full flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Discover</h1>
            <p className="text-muted-foreground">Find your next favorite watch</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex bg-muted rounded-lg p-1 w-fit">
            <button 
              onClick={() => { setType(GetTmdbGenresType.movie); setSelectedGenre(undefined); }}
              className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", type === GetTmdbGenresType.movie ? "bg-card text-foreground shadow" : "text-muted-foreground")}
            >
              Movies
            </button>
            <button 
              onClick={() => { setType(GetTmdbGenresType.tv); setSelectedGenre(undefined); }}
              className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", type === GetTmdbGenresType.tv ? "bg-card text-foreground shadow" : "text-muted-foreground")}
            >
              TV Series
            </button>
          </div>

          <div className="flex-1 overflow-x-auto no-scrollbar py-1">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedGenre(undefined)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap",
                  selectedGenre === undefined ? "bg-primary border-primary text-primary-foreground" : "bg-transparent border-border text-muted-foreground hover:border-white/30 hover:text-white"
                )}
              >
                All Genres
              </button>
              {genres.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGenre(g.id)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap",
                    selectedGenre === g.id ? "bg-primary border-primary text-primary-foreground" : "bg-transparent border-border text-muted-foreground hover:border-white/30 hover:text-white"
                  )}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4 pb-12">
            {items.map((item) => {
              const poster = item.poster_path ? `https://image.tmdb.org/t/p/w780${item.poster_path}` : null;
              const title = item.title || item.name;
              
              return (
                <div key={item.id} className="group relative rounded-xl overflow-hidden bg-card aspect-[2/3] border border-border/50 hover:border-primary/50 transition-colors">
                  {poster ? (
                    <img src={poster} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground p-4 text-center text-xs">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-10 h-10 text-white fill-white" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground py-20">
            No results found for this genre.
          </div>
        )}
      </div>
    </div>
  );
}
