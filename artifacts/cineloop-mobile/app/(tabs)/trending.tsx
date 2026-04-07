import { Feather } from "@expo/vector-icons";
import {
  useGetTrendingAll,
  useGetTrendingMovies,
  useGetTrendingTv,
} from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MediaGrid from "@/components/MediaGrid";
import type { MediaItem } from "@/components/TrailerCard";
import { useColors } from "@/hooks/useColors";

type TrendingTab = "all" | "movies" | "series";

const TABS: { key: TrendingTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "movies", label: "Movies" },
  { key: "series", label: "Series" },
];

export default function TrendingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TrendingTab>("all");

  const { data: allData, isLoading: allLoading } = useGetTrendingAll({ page: 1 });
  const { data: moviesData, isLoading: moviesLoading } = useGetTrendingMovies({ page: 1 });
  const { data: tvData, isLoading: tvLoading } = useGetTrendingTv({ page: 1 });

  const items: MediaItem[] =
    tab === "all"
      ? (allData?.results ?? []) as MediaItem[]
      : tab === "movies"
      ? (moviesData?.results ?? []) as MediaItem[]
      : (tvData?.results ?? []) as MediaItem[];

  const loading = allLoading || moviesLoading || tvLoading;

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerRow}>
          <Feather name="trending-up" size={22} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Trending</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: tab === t.key ? colors.primary : colors.muted,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: tab === t.key ? "#fff" : colors.mutedForeground },
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <MediaGrid items={items} />
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
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  tabScroll: {
    flexGrow: 0,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
