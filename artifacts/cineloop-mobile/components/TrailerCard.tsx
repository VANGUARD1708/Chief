import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUserData } from "@/contexts/UserDataContext";
import { useColors } from "@/hooks/useColors";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

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
  trailerKey?: string | null;
}

interface TrailerCardProps {
  item: MediaItem;
  isActive: boolean;
}

function ActionButton({
  icon,
  label,
  active,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  active?: boolean;
  color: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
      <Feather
        name={icon as never}
        size={26}
        color={active ? color : "#ffffff"}
      />
      <Text style={[styles.actionLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function TrailerCard({ item, isActive }: TrailerCardProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { toggleLike, toggleSave, isLiked, isSaved } = useUserData();
  const liked = isLiked(item.id);
  const saved = isSaved(item.id);

  const title = item.title ?? item.name ?? "Unknown";
  const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const isMovie = item.media_type === "movie" || !!item.release_date;

  const backdropUrl = item.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
    : item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : null;

  const openTrailer = useCallback(async () => {
    if (!item.trailerKey) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const url = `https://www.youtube.com/watch?v=${item.trailerKey}`;
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  }, [item.trailerKey]);

  const handleLike = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLike(item.id);
  }, [item.id, toggleLike]);

  const handleSave = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSave(item.id);
  }, [item.id, toggleSave]);

  const cardHeight = Platform.OS === "web" ? SCREEN_HEIGHT - 84 : SCREEN_HEIGHT;

  return (
    <View style={[styles.card, { height: cardHeight }]}>
      {backdropUrl ? (
        <Image source={{ uri: backdropUrl }} style={styles.backdrop} resizeMode="cover" />
      ) : (
        <View style={[styles.backdrop, { backgroundColor: colors.card }]} />
      )}
      <View style={styles.overlay} />

      {item.trailerKey && (
        <Pressable style={styles.playButton} onPress={openTrailer}>
          <View style={styles.playCircle}>
            <Feather name="play" size={32} color="#ffffff" />
          </View>
        </Pressable>
      )}

      <View
        style={[
          styles.bottomArea,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 90 : 90) },
        ]}
      >
        <View style={styles.metaCol}>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{isMovie ? "MOVIE" : "SERIES"}</Text>
            </View>
            {rating && (
              <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
                <Feather name="star" size={10} color="#f5c518" />
                <Text style={[styles.badgeText, { marginLeft: 3 }]}>{rating}</Text>
              </View>
            )}
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {year ? <Text style={[styles.year, { color: colors.mutedForeground }]}>{year}</Text> : null}
          <Text style={[styles.overview, { color: colors.mutedForeground }]} numberOfLines={3}>
            {item.overview}
          </Text>
          {item.trailerKey && (
            <TouchableOpacity
              style={[styles.watchBtn, { borderColor: colors.primary }]}
              onPress={openTrailer}
              activeOpacity={0.8}
            >
              <Feather name="play" size={14} color={colors.primary} />
              <Text style={[styles.watchBtnText, { color: colors.primary }]}>Watch Trailer</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionsCol}>
          <ActionButton
            icon="heart"
            label={liked ? "Liked" : "Like"}
            active={liked}
            color={colors.primary}
            onPress={handleLike}
          />
          <ActionButton
            icon="bookmark"
            label={saved ? "Saved" : "Save"}
            active={saved}
            color="#facc15"
            onPress={handleSave}
          />
          <ActionButton
            icon="share-2"
            label="Share"
            active={false}
            color={colors.primary}
            onPress={() => {}}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  playButton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(244,62,92,0.85)",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 4,
  },
  bottomArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 60,
    backgroundColor: "transparent",
  },
  metaCol: {
    flex: 1,
    marginRight: 12,
  },
  badges: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  title: {
    color: "#ffffff",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    lineHeight: 28,
    marginBottom: 4,
  },
  year: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 6,
  },
  overview: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginBottom: 12,
  },
  watchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: "flex-start",
  },
  watchBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  actionsCol: {
    alignItems: "center",
    gap: 20,
    paddingBottom: 8,
  },
  actionBtn: {
    alignItems: "center",
    gap: 4,
  },
  actionLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
