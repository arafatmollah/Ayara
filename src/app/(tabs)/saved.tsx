import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SHADOWS } from '../../constants/theme';
import { getBookmarks, toggleBookmark, getLastRead, getRecentHistory } from '../../services/storage';
import { BookmarkItem, LastReadItem } from '../../types/quran';

export default function SavedScreen() {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [lastRead, setLastRead] = useState<LastReadItem | null>(null);
  const [historyList, setHistoryList] = useState<LastReadItem[]>([]);

  const loadData = async () => {
    const [b, l, h] = await Promise.all([getBookmarks(), getLastRead(), getRecentHistory()]);
    setBookmarks(b);
    setLastRead(l);
    setHistoryList(h);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const handleOpenBookmark = (item: BookmarkItem) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: '/surah/[id]',
      params: {
        id: item.surah.toString(),
        targetAyah: item.ayah.toString(),
      },
    });
  };

  const handleOpenHistory = (item: LastReadItem) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: '/surah/[id]',
      params: {
        id: item.surah.toString(),
        targetAyah: item.ayah.toString(),
      },
    });
  };

  const handleDeleteBookmark = async (item: BookmarkItem) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    await toggleBookmark(item);
    loadData();
  };

  const formatTimestamp = (ts: number): string => {
    const diffMin = Math.round((Date.now() - ts) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.round(diffHours / 24)}d ago`;
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.subGreeting}>Saved & History</Text>
          <Text style={styles.appTitle}>Your Sanctuary</Text>
        </View>
        <View style={styles.headerIconBox}>
          <Ionicons name="bookmark" size={22} color={COLORS.primary} />
        </View>
      </View>

      {/* Last Read Resume Card */}
      {lastRead && (
        <View style={styles.sectionHeaderBox}>
          <Text style={styles.sectionTitle}>Current Reading Position</Text>
          <TouchableOpacity
            style={styles.lastReadCard}
            onPress={() =>
              router.push({
                pathname: '/surah/[id]',
                params: {
                  id: lastRead.surah.toString(),
                  targetAyah: lastRead.ayah.toString(),
                },
              })
            }
            activeOpacity={0.7}
          >
            <View style={styles.lastReadLeft}>
              <View style={styles.lastReadNumberBadge}>
                <Text style={styles.lastReadNumberText}>{lastRead.surah}</Text>
              </View>
              <View>
                <Text style={styles.lastReadName}>{lastRead.surahName}</Text>
                <Text style={styles.lastReadAyah}>Verse {lastRead.ayah}</Text>
              </View>
            </View>
            <View style={styles.resumePill}>
              <Text style={styles.resumePillText}>Resume</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.textInverse} />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab Switcher: Bookmarks vs History */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'bookmarks' && styles.tabBtnActive]}
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch {}
            setActiveTab('bookmarks');
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, activeTab === 'bookmarks' && styles.tabBtnTextActive]}>
            Bookmarks ({bookmarks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch {}
            setActiveTab('history');
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, activeTab === 'history' && styles.tabBtnTextActive]}>
            History ({historyList.length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {activeTab === 'bookmarks' ? (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.bookmarkCard}
              onPress={() => handleOpenBookmark(item)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>
                    {item.surahName} : {item.ayah}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteBookmark(item)}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel="Remove Bookmark"
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.arabicSnippet} numberOfLines={2}>
                {item.arabicSnippet}
              </Text>

              {item.translationSnippet ? (
                <Text style={styles.translationSnippet} numberOfLines={2}>
                  {item.translationSnippet}
                </Text>
              ) : null}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={52} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
              <Text style={styles.emptySub}>
                Tap the bookmark icon beside any verse while reading to save it here for quick access.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={historyList}
          keyExtractor={(item, index) => `${item.surah}:${item.ayah}:${index}`}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.historyCard}
              onPress={() => handleOpenHistory(item)}
              activeOpacity={0.7}
            >
              <View style={styles.historyLeft}>
                <View style={styles.historyNumberBadge}>
                  <Text style={styles.historyNumberText}>{item.surah}</Text>
                </View>
                <View>
                  <Text style={styles.historySurahName}>{item.surahName}</Text>
                  <Text style={styles.historyAyahText}>
                    Verse {item.ayah} • {formatTimestamp(item.timestamp)}
                  </Text>
                </View>
              </View>
              <View style={styles.historyArrowBox}>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primaryDark} />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={52} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Reading History Yet</Text>
              <Text style={styles.emptySub}>
                As you read verses in the Quran, your recent reading sessions will appear dynamically here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 90,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subGreeting: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  appTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 24,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.goldSurface,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderBox: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lastReadCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  lastReadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastReadNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lastReadNumberText: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    color: COLORS.primaryDark,
  },
  lastReadName: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  lastReadAyah: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  resumePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  resumePillText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textInverse,
  },
  bookmarksCountTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  bookmarkCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tagBadge: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  tagBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    color: COLORS.primaryDark,
  },
  deleteBtn: {
    padding: 4,
  },
  arabicSnippet: {
    fontFamily: FONTS.arabicMedium,
    fontSize: 20,
    color: COLORS.textArabic,
    textAlign: 'right',
    lineHeight: 34,
    marginBottom: 6,
  },
  translationSnippet: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginTop: 14,
  },
  emptySub: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    padding: 4,
    marginTop: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  tabBtnText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  tabBtnTextActive: {
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  historyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyNumberBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  historyNumberText: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    color: COLORS.primaryDark,
  },
  historySurahName: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  historyAyahText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  historyArrowBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
