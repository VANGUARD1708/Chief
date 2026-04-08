import { useState } from "react";
import { useUserData } from "@/hooks/use-user-data";
import { User, Heart, Bookmark, Pencil, Check, X, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { username, setUsername, likes, saves } = useUserData();
  const [activeTab, setActiveTab] = useState<"likes" | "saves">("likes");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(username);

  const items = activeTab === "likes" ? likes : saves;

  const confirmEdit = () => {
    const trimmed = draft.trim();
    if (trimmed) setUsername(trimmed);
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft(username);
    setEditing(false);
  };

  return (
    <div className="w-full min-h-screen bg-background overflow-y-auto pb-24 md:pb-6">

      {/* Profile Header */}
      <div className="relative pt-20 pb-8 px-4 md:px-8 border-b border-border/50 bg-card/30">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-6">

          {/* Avatar */}
          <div className="w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-full bg-gradient-to-tr from-primary to-purple-600 p-[3px]">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
              <User className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left min-w-0">
            {editing ? (
              <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") cancelEdit(); }}
                  className="text-2xl font-bold bg-transparent border-b-2 border-primary outline-none text-foreground w-full max-w-xs"
                  maxLength={32}
                />
                <button onClick={confirmEdit} className="p-1 text-primary hover:text-primary/80"><Check className="w-5 h-5" /></button>
                <button onClick={cancelEdit} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate max-w-[220px] md:max-w-none">{username}</h1>
                <button
                  onClick={() => { setDraft(username); setEditing(true); }}
                  className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-muted-foreground text-sm">CINELOOP member</p>

            <div className="flex items-center justify-center md:justify-start gap-8 mt-5">
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold text-primary">{likes.length}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Likes</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold text-foreground">{saves.length}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Saved</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-8">

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab("likes")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors relative text-sm md:text-base",
              activeTab === "likes" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className={cn("w-4 h-4 md:w-5 md:h-5", activeTab === "likes" && "fill-primary")} />
            Likes <span className="ml-1 text-xs opacity-70">({likes.length})</span>
            {activeTab === "likes" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>

          <button
            onClick={() => setActiveTab("saves")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors relative text-sm md:text-base",
              activeTab === "saves" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Bookmark className={cn("w-4 h-4 md:w-5 md:h-5", activeTab === "saves" && "fill-foreground")} />
            Saved <span className="ml-1 text-xs opacity-70">({saves.length})</span>
            {activeTab === "saves" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />}
          </button>
        </div>

        {/* Grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
            {items.map((item) => {
              const poster = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null;
              const title = item.title || item.name;

              return (
                <div key={item.id} className="group relative rounded-lg overflow-hidden bg-card aspect-[2/3] border border-border/50 hover:border-primary/50 transition-colors">
                  {poster ? (
                    <img src={poster} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground p-2 text-center text-xs">No Image</div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-3 backdrop-blur-sm">
                    <Play className="w-8 h-8 text-white fill-white mb-2" />
                    <p className="text-white text-xs font-medium px-2 text-center line-clamp-2">{title}</p>
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
                <p className="text-sm">Double-tap a video in the feed to like it</p>
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
