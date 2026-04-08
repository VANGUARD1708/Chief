import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUserData, type MediaItem } from "@/contexts/UserDataContext";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const THUMB_SIZE = (SCREEN_WIDTH - 48) / 3;

function MovieThumb({ item }: { item: MediaItem }) {
  const colors = useColors();
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
    : null;
  const title = item.title ?? item.name ?? "";
  return (
    <View style={[styles.thumb, { width: THUMB_SIZE, height: THUMB_SIZE * 1.45 }]}>
      {posterUrl ? (
        <Image source={{ uri: posterUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }]}>
          <Feather name="film" size={20} color={colors.mutedForeground} />
        </View>
      )}
      <View style={styles.thumbOverlay} />
      <Text style={styles.thumbTitle} numberOfLines={2}>{title}</Text>
    </View>
  );
}

function StatCard({ icon, value, label, accent }: { icon: string; value: number; label: string; accent?: boolean }) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icon as never} size={16} color={accent ? colors.primary : colors.mutedForeground} />
      <Text style={[styles.statValue, { color: accent ? colors.primary : colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { username, setUsername, likedItems, savedItems } = useUserData();
  const [activeTab, setActiveTab] = useState<"likes" | "saves">("likes");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(username);

  const items = activeTab === "likes" ? likedItems : savedItems;
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const confirmEdit = () => {
    const t = draft.trim();
    if (t) setUsername(t);
    setEditing(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={[styles.hero, { paddingTop: topPad + 20 }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {(username[0] ?? "C").toUpperCase()}
          </Text>
        </View>

        {editing ? (
          <View style={styles.editRow}>
            <TextInput
              autoFocus
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={confirmEdit}
              style={[styles.nameInput, { color: colors.foreground, borderBottomColor: colors.primary }]}
              maxLength={28}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={confirmEdit} style={styles.editConfirm}>
              <Feather name="check" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setDraft(username); setEditing(false); }}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.usernameRow}
            onPress={() => { setDraft(username); setEditing(true); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.username, { color: colors.foreground }]}>{username}</Text>
            <Feather name="edit-2" size={14} color={colors.mutedForeground} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        )}
        <Text style={[styles.bio, { color: colors.mutedForeground }]}>CINELOOP member</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard icon="heart" value={likedItems.length} label="Liked" accent />
        <StatCard icon="bookmark" value={savedItems.length} label="Saved" />
        <StatCard icon="eye" value={likedItems.length + savedItems.length} label="Watched" />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsRow, { borderBottomColor: colors.border }]}>
        {(["likes", "saves"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab)}
          >
            <Feather
              name={tab === "likes" ? "heart" : "bookmark"}
              size={15}
              color={activeTab === tab ? colors.primary : colors.mutedForeground}
            />
            <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.mutedForeground }]}>
              {tab === "likes" ? `Liked (${likedItems.length})` : `Saved (${savedItems.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Grid */}
      {items.length > 0 ? (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          numColumns={3}
          scrollEnabled={false}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => <MovieThumb item={item} />}
        />
      ) : (
        <View style={styles.empty}>
          <Feather
            name={activeTab === "likes" ? "heart" : "bookmark"}
            size={40}
            color={colors.mutedForeground}
          />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            {activeTab === "likes" ? "No likes yet" : "No saves yet"}
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            {activeTab === "likes"
              ? "Tap the heart on any trailer in the feed"
              : "Tap the bookmark on any trailer to save it"}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    fontSize: 34,
    fontFamily: "Inter_700Bold",
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  username: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  nameInput: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    borderBottomWidth: 2,
    paddingBottom: 2,
    minWidth: 140,
  },
  editConfirm: { marginLeft: 4 },
  bio: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
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
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  grid: {
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
  },
  gridRow: {
    gap: 8,
    marginBottom: 8,
  },
  thumb: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#0a0a0a",
  },
  thumbOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  thumbTitle: {
    position: "absolute",
    bottom: 6,
    left: 6,
    right: 6,
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 13,
  },
  empty: {
    alignItems: "center",
    paddingTop: 50,
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 19,
  },
});
