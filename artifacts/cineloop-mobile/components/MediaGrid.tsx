import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useUserData, type MediaItem } from "@/contexts/UserDataContext";
import { useColors } from "@/hooks/useColors";

const NUM_COLS = 2;
const GAP = 8;
const PADDING = 12;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP) / NUM_COLS;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface MediaGridProps {
  items: MediaItem[];
  onItemPress?: (item: MediaItem) => void;
  emptyText?: string;
  numColumns?: number;
}

function GridItem({ item, onPress }: { item: MediaItem; onPress?: () => void }) {
  const colors = useColors();
  const { isLiked, toggleLike } = useUserData();
  const liked = isLiked(item.id);
  const title = item.title ?? item.name ?? "";
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : null;
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <TouchableOpacity
      style={[styles.card, { width: CARD_WIDTH, height: CARD_HEIGHT }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {posterUrl ? (
        <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={[styles.poster, { backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }]}>
          <Feather name="film" size={32} color={colors.mutedForeground} />
        </View>
      )}
      <View style={styles.cardOverlay} />
      <View style={styles.cardBottom}>
        <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
        {rating && (
          <View style={styles.ratingRow}>
            <Feather name="star" size={10} color="#f5c518" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={[styles.likeBtn, liked && { backgroundColor: "rgba(244,62,92,0.85)", borderColor: "transparent" }]}
        onPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          toggleLike(item);
        }}
        hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
      >
        <Feather name="heart" size={13} color={liked ? "#fff" : "rgba(255,255,255,0.8)"} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function MediaGrid({
  items,
  onItemPress,
  emptyText = "No content found",
  numColumns = NUM_COLS,
}: MediaGridProps) {
  const colors = useColors();

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Feather name="film" size={40} color={colors.mutedForeground} />
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.id)}
      numColumns={numColumns}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <GridItem item={item} onPress={() => onItemPress?.(item)} />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: PADDING,
    gap: GAP,
  },
  row: {
    gap: GAP,
  },
  card: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#0a0a0a",
  },
  poster: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cardBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 16,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 3,
  },
  ratingText: {
    color: "#f5c518",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  likeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
