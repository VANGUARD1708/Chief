import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  media_type?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  popularity?: number;
  vote_count?: number;
  trailerKey?: string | null;
}

interface UserDataContextType {
  username: string;
  setUsername: (name: string) => void;
  likedItems: MediaItem[];
  savedItems: MediaItem[];
  likedIds: Set<number>;
  savedIds: Set<number>;
  toggleLike: (item: MediaItem) => void;
  toggleSave: (item: MediaItem) => void;
  isLiked: (id: number) => boolean;
  isSaved: (id: number) => boolean;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

const USERNAME_KEY = "cineloop_username";
const LIKES_KEY = "cineloop_likes";
const SAVES_KEY = "cineloop_saves";

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsernameState] = useState("CineLoop User");
  const [likedItems, setLikedItems] = useState<MediaItem[]>([]);
  const [savedItems, setSavedItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [uRaw, lRaw, sRaw] = await Promise.all([
          AsyncStorage.getItem(USERNAME_KEY),
          AsyncStorage.getItem(LIKES_KEY),
          AsyncStorage.getItem(SAVES_KEY),
        ]);
        if (uRaw) setUsernameState(JSON.parse(uRaw));
        if (lRaw) setLikedItems(JSON.parse(lRaw) as MediaItem[]);
        if (sRaw) setSavedItems(JSON.parse(sRaw) as MediaItem[]);
      } catch {}
    }
    load();
  }, []);

  const setUsername = async (name: string) => {
    setUsernameState(name);
    try { await AsyncStorage.setItem(USERNAME_KEY, JSON.stringify(name)); } catch {}
  };

  const toggleLike = (item: MediaItem) => {
    setLikedItems((prev) => {
      const next = prev.some((l) => l.id === item.id)
        ? prev.filter((l) => l.id !== item.id)
        : [...prev, item];
      AsyncStorage.setItem(LIKES_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const toggleSave = (item: MediaItem) => {
    setSavedItems((prev) => {
      const next = prev.some((s) => s.id === item.id)
        ? prev.filter((s) => s.id !== item.id)
        : [...prev, item];
      AsyncStorage.setItem(SAVES_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const likedIds = new Set(likedItems.map((l) => l.id));
  const savedIds = new Set(savedItems.map((s) => s.id));

  const isLiked = (id: number) => likedIds.has(id);
  const isSaved = (id: number) => savedIds.has(id);

  return (
    <UserDataContext.Provider
      value={{
        username,
        setUsername,
        likedItems,
        savedItems,
        likedIds,
        savedIds,
        toggleLike,
        toggleSave,
        isLiked,
        isSaved,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUserData must be used within UserDataProvider");
  return ctx;
}
