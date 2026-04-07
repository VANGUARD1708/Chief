import { Feather } from "@expo/vector-icons";
import {
  useGetTrendingAll,
  useGetTrendingMovies,
  useGetTrendingTv,
  useGetAnime,
  useGetTmdbVideos,
} from "@workspace/api-client-react";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import TrailerCard, { type MediaItem } from "@/components/TrailerCard";
import { useColors } from "@/hooks/useColors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type FeedCategory = "forYou" | "trending" | "movies" | "series" | "anime";

const CATEGORIES: { key: FeedCategory; label: string }[] = [
  { key: "forYou", label: "For You" },
  { key: "trending", label: "Trending" },
  { key: "movies", label: "Movies" },
  { key: "series", label: "Series" },
  { key: "anime", label: "Anime" },
];

function useTrailerKey(id: number, mediaType: string) {
  const type = mediaType === "movie" || mediaType === "tv" ? mediaType : "movie";
  const { data } = useGetTmdbVideos({ id, type: type as "movie" | "tv" });
  const trailer = data?.results?.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );
  return trailer?.key ?? null;
}

function FeedItem({ item, isActive }: { item: MediaItem; isActive: boolean }) {
  const type: "movie" | "tv" =
    item.media_type === "tv" ? "tv" : "movie";
  const { data: videosData } = useGetTmdbVideos(
    { id: item.id, type },
    { query: { enabled: isActive } }
  );
  const trailerKey =
    videosData?.results?.find(
      (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
    )?.key ?? null;

  const enriched: MediaItem = { ...item, trailerKey };
  return <TrailerCard item={enriched} isActive={isActive} />;
}

function useFeedData(category: FeedCategory) {
  const { data: allData, isLoading: allLoading } = useGetTrendingAll(
    { page: 1 },
    { query: { enabled: category === "forYou" } }
  );
  const { data: trendData, isLoading: trendLoading } = useGetTrendingAll(
    { page: 1 },
    { query: { enabled: category === "trending" } }
  );
  const { data: moviesData, isLoading: moviesLoading } = useGetTrendingMovies(
    { page: 1 },
    { query: { enabled: category === "movies" } }
  );
  const { data: seriesData, isLoading: seriesLoading } = useGetTrendingTv(
    { page: 1 },
    { query: { enabled: category === "series" } }
  );
  const { data: animeData, isLoading: animeLoading } = useGetAnime(
    { page: 1 },
    { query: { enabled: category === "anime" } }
  );

  switch (category) {
    case "forYou":
      return { items: (allData?.results ?? []) as MediaItem[], loading: allLoading };
    case "trending":
      return { items: (trendData?.results ?? []) as MediaItem[], loading: trendLoading };
    case "movies":
      return { items: (moviesData?.results ?? []) as MediaItem[], loading: moviesLoading };
    case "series":
      return { items: (seriesData?.results ?? []) as MediaItem[], loading: seriesLoading };
    case "anime":
      return { items: (animeData?.results ?? []) as MediaItem[], loading: animeLoading };
  }
}

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<FeedCategory>("forYou");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const { items, loading } = useFeedData(category);

  const cardHeight = Platform.OS === "web" ? SCREEN_HEIGHT - 84 : SCREEN_HEIGHT;

  const handleViewableChanged = useCallback(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.tabsBar,
          { top: insets.top + (Platform.OS === "web" ? 67 : 0) },
        ]}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            onPress={() => {
              setCategory(cat.key);
              setActiveIndex(0);
              listRef.current?.scrollToOffset({ offset: 0, animated: false });
            }}
            style={styles.tabItem}
          >
            <Text
              style={[
                styles.tabText,
                category === cat.key
                  ? { color: "#fff", fontFamily: "Inter_700Bold" }
                  : { color: "rgba(255,255,255,0.55)", fontFamily: "Inter_400Regular" },
              ]}
            >
              {cat.label}
            </Text>
            {category === cat.key && (
              <View style={[styles.tabUnderline, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.loader}>
          <Feather name="film" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No trailers found
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <FeedItem item={item} isActive={index === activeIndex} />
          )}
          pagingEnabled
          snapToInterval={cardHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={handleViewableChanged}
          viewabilityConfig={viewabilityConfig.current}
          getItemLayout={(_, index) => ({
            length: cardHeight,
            offset: cardHeight * index,
            index,
          })}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsBar: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  tabItem: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tabText: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  tabUnderline: {
    height: 2,
    width: "100%",
    borderRadius: 1,
    marginTop: 2,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
});
