import { useState } from "react";
import { useUserData } from "@/hooks/use-user-data";
import { User, Heart, Bookmark, Settings, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { likes, saves } = useUserData();
  const [activeTab, setActiveTab] = useState<"likes" | "saves">("likes");

  const items = activeTab === "likes" ? likes : saves;

  return (
    <div className="w-full min-h-screen bg-background overflow-y-auto pb-24 md:pb-6">
      
      {/* Profile Header */}
      <div className="relative pt-20 pb-8 px-4 md:px-8 border-b border-border/50 bg-card/30">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-primary to-purple-600 p-1">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
              <User className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Cinephile User</h1>
            <p className="text-muted-foreground">Joined today</p>
            
            <div className="flex items-center justify-center md:justify-start gap-6 mt-4">
              <div className="text-center md:text-left">
                <p className="text-xl font-bold text-foreground">{likes.length}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Likes</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-xl font-bold text-foreground">{saves.length}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Saved</p>
              </div>
            </div>
          </div>
          
          <button className="p-3 rounded-full bg-card hover:bg-muted text-foreground transition-colors border border-border">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        
        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          <button 
            onClick={() => setActiveTab("likes")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors relative",
              activeTab === "likes" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className={cn("w-5 h-5", activeTab === "likes" && "fill-primary")} />
            Likes
            {activeTab === "likes" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          
          <button 
            onClick={() => setActiveTab("saves")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors relative",
              activeTab === "saves" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Bookmark className={cn("w-5 h-5", activeTab === "saves" && "fill-foreground")} />
            Saves
            {activeTab === "saves" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />}
          </button>
        </div>

        {/* Grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
            {items.map((item) => {
              const poster = item.poster_path ? `https://image.tmdb.org/t/p/w780${item.poster_path}` : null;
              const title = item.title || item.name;
              
              return (
                <div key={item.id} className="group relative rounded-lg overflow-hidden bg-card aspect-[2/3] border border-border/50">
                  {poster ? (
                    <img src={poster} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground p-2 text-center text-xs">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            {activeTab === "likes" ? (
              <>
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">No likes yet</h3>
                <p className="text-sm">Double tap a video in the feed to like it</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Bookmark className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">No saves yet</h3>
                <p className="text-sm">Save videos to watch them later</p>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
