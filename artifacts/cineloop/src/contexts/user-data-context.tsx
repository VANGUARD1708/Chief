import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TmdbMediaItem } from "@workspace/api-client-react";

const USERNAME_KEY = "cineloop_username";
const LIKES_KEY = "cineloop_likes";
const SAVES_KEY = "cineloop_saves";

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

interface UserDataContextType {
  username: string;
  setUsername: (name: string) => void;
  likes: TmdbMediaItem[];
  saves: TmdbMediaItem[];
  isLiked: (id: number) => boolean;
  isSaved: (id: number) => boolean;
  toggleLike: (item: TmdbMediaItem) => void;
  toggleSave: (item: TmdbMediaItem) => void;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [username, setUsernameState] = useState<string>(() =>
    loadJson<string>(USERNAME_KEY, "Cinephile")
  );
  const [likes, setLikes] = useState<TmdbMediaItem[]>(() =>
    loadJson<TmdbMediaItem[]>(LIKES_KEY, [])
  );
  const [saves, setSaves] = useState<TmdbMediaItem[]>(() =>
    loadJson<TmdbMediaItem[]>(SAVES_KEY, [])
  );

  useEffect(() => {
    localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
  }, [likes]);

  useEffect(() => {
    localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
  }, [saves]);

  const setUsername = (name: string) => {
    setUsernameState(name);
    localStorage.setItem(USERNAME_KEY, JSON.stringify(name));
  };

  const isLiked = (id: number) => likes.some((l) => l.id === id);
  const isSaved = (id: number) => saves.some((s) => s.id === id);

  const toggleLike = (item: TmdbMediaItem) => {
    setLikes((prev) =>
      prev.some((l) => l.id === item.id)
        ? prev.filter((l) => l.id !== item.id)
        : [...prev, item]
    );
  };

  const toggleSave = (item: TmdbMediaItem) => {
    setSaves((prev) =>
      prev.some((s) => s.id === item.id)
        ? prev.filter((s) => s.id !== item.id)
        : [...prev, item]
    );
  };

  return (
    <UserDataContext.Provider
      value={{ username, setUsername, likes, saves, isLiked, isSaved, toggleLike, toggleSave }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUserData must be used inside UserDataProvider");
  return ctx;
}
