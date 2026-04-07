import { Feather } from "@expo/vector-icons";
import { useGetTrendingAll } from "@workspace/api-client-react";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { MediaItem } from "@/components/TrailerCard";
import { useColors } from "@/hooks/useColors";

function RankBadge({ rank }: { rank: number }) {
  const colors = useColors();
  if (rank === 1)
    return (
      <View style={[styles.rankBadge, { backgroundColor: "#FFD700" }]}>
        <Text style={styles.rankBadgeText}>1</Text>
      </View>
    );
  if (rank === 2)
    return (
      <View style={[styles.rankBadge, { backgroundColor: "#C0C0C0" }]}>
        <Text style={styles.rankBadgeText}>2</Text>
      </View>
    );
  if (rank === 3)
    return (
      <View style={[styles.rankBadge, { backgroundColor: "#CD7F32" }]}>
        <Text style={styles.rankBadgeText}>3</Text>
      </View>
    );
  return (
    <View style={[styles.rankBadge, { backgroundColor: colors.muted }]}>
      <Text style={[styles.rankBadgeText, { color: colors.mutedForeground }]}>{rank}</Text>
    </View>
  );
}

function LeaderboardItem({ item, rank }: { item: MediaItem; rank: number }) {
  const colors = useColors();
  const title = item.title ?? item.name ?? "";
  const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "—";
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
    : null;

  const barWidth = Math.max(20, Math.min(100, (item.popularity ?? 0) / 5));

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <RankBadge rank={rank} />
      {posterUrl ? (
        <Image source={{ uri: posterUrl }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, { backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }]}>
          <Feather name="film" size={18} color={colors.mutedForeground} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.metaRow}>
          {year ? (
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{year}</Text>
          ) : null}
          <View style={styles.starRow}>
            <Feather name="star" size={11} color="#f5c518" />
            <Text style={[styles.metaText, { color: "#f5c518" }]}>{rating}</Text>
          </View>
        </View>
        <View style={[styles.barBg, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${barWidth}%` as `${number}%`,
                backgroundColor: rank <= 3 ? "#f43e5c" : colors.border,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, isLoading } = useGetTrendingAll({ page: 1 });

  const items = [...((data?.results ?? []) as MediaItem[])]
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, 20);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerRow}>
          <Feather name="award" size={22} color="#FFD700" />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Leaderboard</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Most popular right now
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <LeaderboardItem item={item} rank={index + 1} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingBottom: 100,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  thumb: {
    width: 44,
    height: 60,
    borderRadius: 6,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  barBg: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 2,
  },
});
