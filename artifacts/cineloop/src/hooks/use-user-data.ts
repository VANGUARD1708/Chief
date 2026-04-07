import { useState, useEffect } from "react";
import { TmdbMediaItem } from "@workspace/api-client-react";

export function useUserData() {
  const [likes, setLikes] = useState<TmdbMediaItem[]>(() => {
    const saved = localStorage.getItem("cineloop_likes");
    return saved ? JSON.parse(saved) : [];
  });

  const [saves, setSaves] = useState<TmdbMediaItem[]>(() => {
    const saved = localStorage.getItem("cineloop_saves");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cineloop_likes", JSON.stringify(likes));
  }, [likes]);

  useEffect(() => {
    localStorage.setItem("cineloop_saves", JSON.stringify(saves));
  }, [saves]);

  const isLiked = (id: number) => likes.some((item) => item.id === id);
  const isSaved = (id: number) => saves.some((item) => item.id === id);

  const toggleLike = (item: TmdbMediaItem) => {
    if (isLiked(item.id)) {
      setLikes(likes.filter((l) => l.id !== item.id));
    } else {
      setLikes([...likes, item]);
    }
  };

  const toggleSave = (item: TmdbMediaItem) => {
    if (isSaved(item.id)) {
      setSaves(saves.filter((s) => s.id !== item.id));
    } else {
      setSaves([...saves, item]);
    }
  };

  return { likes, saves, isLiked, isSaved, toggleLike, toggleSave };
}
