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

import { useUserData, type MediaItem } from "@/contexts/UserDataContext";
import { useColors } from "@/hooks/useColors";

export type { MediaItem };

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface TrailerCardProps {
  item: MediaItem;
  isActive: boolean;
}

function ActionButton({
  icon,
  label,
  active,
  activeColor,
  onPress,
}: {
  icon: string;
  label: string;
  active?: boolean;
  activeColor: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
      <View style={[
        styles.actionCircle,
        active && { backgroundColor: activeColor + "33", borderColor: activeColor },
      ]}>
        <Feather name={icon as never} size={24} color={active ? activeColor : "#ffffff"} />
      </View>
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
    await WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${item.trailerKey}`, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  }, [item.trailerKey]);

  const handleLike = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLike(item);
  }, [item, toggleLike]);

  const handleSave = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSave(item);
  }, [item, toggleSave]);

  const cardHeight = Platform.OS === "web" ? SCREEN_HEIGHT - 84 : SCREEN_HEIGHT;
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 90 : 85);

  return (
    <View style={[styles.card, { height: cardHeight }]}>
      {backdropUrl ? (
        <Image source={{ uri: backdropUrl }} style={styles.backdrop} resizeMode="cover" />
      ) : (
        <View style={[styles.backdrop, { backgroundColor: colors.card }]} />
      )}
      <View style={styles.overlay} />

      {item.trailerKey && (
        <Pressable style={styles.playHitArea} onPress={openTrailer}>
          <View style={styles.playCircle}>
            <Feather name="play" size={30} color="#ffffff" />
          </View>
        </Pressable>
      )}

      <View style={[styles.bottomArea, { paddingBottom: bottomPad }]}>
        <View style={styles.metaCol}>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{isMovie ? "MOVIE" : "SERIES"}</Text>
            </View>
            {rating && (
              <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.7)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" }]}>
                <Feather name="star" size={10} color="#f5c518" />
                <Text style={[styles.badgeText, { marginLeft: 3, color: "#f5c518" }]}>{rating}</Text>
              </View>
            )}
            {year ? (
              <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
                <Text style={[styles.badgeText, { color: "rgba(255,255,255,0.7)" }]}>{year}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={[styles.overview, { color: colors.mutedForeground }]} numberOfLines={3}>
            {item.overview}
          </Text>
          {item.trailerKey && (
            <TouchableOpacity
              style={[styles.watchBtn, { borderColor: colors.primary }]}
              onPress={openTrailer}
              activeOpacity={0.8}
            >
              <Feather name="play" size={13} color={colors.primary} />
              <Text style={[styles.watchBtnText, { color: colors.primary }]}>Watch Trailer</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionsCol}>
          <ActionButton icon="heart" label={liked ? "Liked" : "Like"} active={liked} activeColor={colors.primary} onPress={handleLike} />
          <ActionButton icon="bookmark" label={saved ? "Saved" : "Save"} active={saved} activeColor="#facc15" onPress={handleSave} />
          <ActionButton icon="share-2" label="Share" active={false} activeColor={colors.primary} onPress={() => {}} />
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
    backgroundColor: "rgba(0,0,0,0.42)",
  },
  playHitArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
    paddingTop: 80,
    background: "linear-gradient(to top, black, transparent)",
  },
  metaCol: {
    flex: 1,
    marginRight: 12,
  },
  badges: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
    flexWrap: "wrap",
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
    fontSize: 21,
    fontFamily: "Inter_700Bold",
    lineHeight: 27,
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
    gap: 16,
    paddingBottom: 4,
  },
  actionBtn: {
    alignItems: "center",
    gap: 4,
  },
  actionCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
});
