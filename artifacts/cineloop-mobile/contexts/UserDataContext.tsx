import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UserDataContextType {
  likedIds: Set<number>;
  savedIds: Set<number>;
  toggleLike: (id: number) => void;
  toggleSave: (id: number) => void;
  isLiked: (id: number) => boolean;
  isSaved: (id: number) => boolean;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

const LIKES_KEY = "cineloop_likes";
const SAVES_KEY = "cineloop_saves";

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const [likesRaw, savesRaw] = await Promise.all([
          AsyncStorage.getItem(LIKES_KEY),
          AsyncStorage.getItem(SAVES_KEY),
        ]);
        if (likesRaw) setLikedIds(new Set(JSON.parse(likesRaw) as number[]));
        if (savesRaw) setSavedIds(new Set(JSON.parse(savesRaw) as number[]));
      } catch {}
    }
    load();
  }, []);

  const toggleLike = (id: number) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      AsyncStorage.setItem(LIKES_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const toggleSave = (id: number) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      AsyncStorage.setItem(SAVES_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const isLiked = (id: number) => likedIds.has(id);
  const isSaved = (id: number) => savedIds.has(id);

  return (
    <UserDataContext.Provider
      value={{ likedIds, savedIds, toggleLike, toggleSave, isLiked, isSaved }}
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
