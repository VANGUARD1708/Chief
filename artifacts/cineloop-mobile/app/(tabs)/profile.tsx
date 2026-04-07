import { Feather } from "@expo/vector-icons";
import { useGetTrendingAll } from "@workspace/api-client-react";
import React, { useMemo } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { MediaItem } from "@/components/TrailerCard";
import { useUserData } from "@/contexts/UserDataContext";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_SIZE = (SCREEN_WIDTH - 48) / 3;

function SavedMovieThumb({ item }: { item: MediaItem }) {
  const colors = useColors();
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
    : null;
  return (
    <View style={[styles.thumb, { width: ITEM_SIZE, height: ITEM_SIZE * 1.4 }]}>
      {posterUrl ? (
        <Image source={{ uri: posterUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" },
          ]}
        >
          <Feather name="film" size={22} color={colors.mutedForeground} />
        </View>
      )}
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icon as never} size={18} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { likedIds, savedIds } = useUserData();
  const { data } = useGetTrendingAll({ page: 1 });

  const allItems = (data?.results ?? []) as MediaItem[];

  const savedItems = useMemo(
    () => allItems.filter((item) => savedIds.has(item.id)),
    [allItems, savedIds]
  );

  const likedItems = useMemo(
    () => allItems.filter((item) => likedIds.has(item.id)),
    [allItems, likedIds]
  );

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroSection, { paddingTop: topPad + 24 }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>C</Text>
        </View>
        <Text style={[styles.username, { color: colors.foreground }]}>CineLoop User</Text>
        <Text style={[styles.bio, { color: colors.mutedForeground }]}>
          Discovering the best trailers
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Liked" value={likedIds.size} icon="heart" />
        <StatCard label="Saved" value={savedIds.size} icon="bookmark" />
        <StatCard label="Watched" value={likedIds.size + savedIds.size} icon="eye" />
      </View>

      {savedItems.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="bookmark" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Saved</Text>
            <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>
              {savedIds.size}
            </Text>
          </View>
          <FlatList
            data={savedItems}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => <SavedMovieThumb item={item} />}
          />
        </View>
      )}

      {likedItems.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="heart" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Liked</Text>
            <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>
              {likedIds.size}
            </Text>
          </View>
          <FlatList
            data={likedItems}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => <SavedMovieThumb item={item} />}
          />
        </View>
      )}

      {savedItems.length === 0 && likedItems.length === 0 && (
        <View style={styles.emptyState}>
          <Feather name="film" size={44} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Your collection is empty
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Like or save trailers to build your list
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },
  username: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  bio: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    flex: 1,
  },
  sectionCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  thumb: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#0a0a0a",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});
