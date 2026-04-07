import { Feather } from "@expo/vector-icons";
import {
  useDiscoverTmdb,
  useGetTmdbGenres,
} from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MediaGrid from "@/components/MediaGrid";
import type { MediaItem } from "@/components/TrailerCard";
import { useColors } from "@/hooks/useColors";
import { useSearchTmdb } from "@workspace/api-client-react";

type MediaType = "movie" | "tv";

export default function DiscoverScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [mediaType, setMediaType] = useState<MediaType>("movie");
  const [selectedGenre, setSelectedGenre] = useState<number | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: genresData } = useGetTmdbGenres({ type: mediaType });
  const genres = genresData?.genres ?? [];

  const { data: discoverData, isLoading: discoverLoading } = useDiscoverTmdb(
    { type: mediaType, genre: selectedGenre, page: 1 },
    { query: { enabled: !searchQuery } }
  );

  const { data: searchData, isLoading: searchLoading } = useSearchTmdb(
    { query: searchQuery, page: 1 },
    { query: { enabled: !!searchQuery } }
  );

  const items: MediaItem[] = searchQuery
    ? (searchData?.results ?? []) as MediaItem[]
    : (discoverData?.results ?? []) as MediaItem[];

  const loading = discoverLoading || searchLoading;

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const handleSearch = () => {
    setSearchQuery(query.trim());
    setSelectedGenre(undefined);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchQuery("");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Discover</Text>

        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search movies & shows..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {!searchQuery && (
          <>
            <View style={styles.typeRow}>
              {(["movie", "tv"] as MediaType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => {
                    setMediaType(t);
                    setSelectedGenre(undefined);
                  }}
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor: mediaType === t ? colors.primary : colors.muted,
                      flex: 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      { color: mediaType === t ? "#fff" : colors.mutedForeground },
                    ]}
                  >
                    {t === "movie" ? "Movies" : "TV Shows"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.genreScroll}
            >
              <TouchableOpacity
                onPress={() => setSelectedGenre(undefined)}
                style={[
                  styles.genreChip,
                  {
                    backgroundColor: !selectedGenre ? colors.primary : colors.muted,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.genreChipText,
                    { color: !selectedGenre ? "#fff" : colors.mutedForeground },
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {genres.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => setSelectedGenre(g.id === selectedGenre ? undefined : g.id)}
                  style={[
                    styles.genreChip,
                    {
                      backgroundColor: g.id === selectedGenre ? colors.primary : colors.muted,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.genreChipText,
                      { color: g.id === selectedGenre ? "#fff" : colors.mutedForeground },
                    ]}
                  >
                    {g.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <MediaGrid items={items} emptyText={searchQuery ? "No results found" : "No content found"} />
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
    paddingBottom: 8,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
  },
  typeBtn: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  typeBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  genreScroll: {
    paddingBottom: 4,
    gap: 8,
  },
  genreChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  genreChipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
