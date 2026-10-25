import React, { useState, useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { COLORS, FONTS, SHADOWS } from '../../constants/theme';
import { getAllSurahs, getAllJuz } from '../../services/quranData';
import { getLastRead } from '../../services/storage';
import { SurahCard } from '../../components/SurahCard';
import { JuzCard } from '../../components/JuzCard';
import { LastReadItem, RevelationType } from '../../types/quran';

type ViewMode = 'surahs' | 'juz';
type FilterType = 'All' | RevelationType;

export default function ReadingLibraryScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('surahs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
  const [lastRead, setLastRead] = useState<LastReadItem | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      getLastRead().then(setLastRead);
    }, [])
  );

  const allSurahs = useMemo(() => getAllSurahs(), []);
  const allJuz = useMemo(() => getAllJuz(), []);

  const filteredSurahs = useMemo(() => {
    let result = allSurahs;
    if (selectedFilter !== 'All') {
      result = result.filter((s) => s.type === selectedFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.n.toString() === q ||
          s.en.toLowerCase().includes(q) ||
          s.meaning.toLowerCase().includes(q) ||
          s.ar.includes(q)
      );
    }
    return result;
  }, [allSurahs, selectedFilter, searchQuery]);

  const filteredJuz = useMemo(() => {
    if (!searchQuery.trim()) return allJuz;
    const q = searchQuery.trim().toLowerCase();
    return allJuz.filter(
      (j) =>
        j.n.toString() === q ||
        j.name.toLowerCase().includes(q) ||
        j.nameAr.includes(q)
    );
  }, [allJuz, searchQuery]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.subGreeting}>Noble Sanctuary</Text>
          <Text style={styles.appTitle}>Quran Reading</Text>
        </View>
        <View style={styles.arabicHeaderBadge}>
          <Text style={styles.arabicHeaderBadgeText}>المصحف الشريف</Text>
        </View>
      </View>

      {/* Mode Switcher (Surahs / Juz) */}
      <View style={styles.modeSwitcher}>
        <TouchableOpacity
          style={[styles.modeBtn, viewMode === 'surahs' && styles.modeBtnActive]}
          onPress={() => setViewMode('surahs')}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.modeBtnText, viewMode === 'surahs' && styles.modeBtnTextActive]}
          >
            114 Surahs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, viewMode === 'juz' && styles.modeBtnActive]}
          onPress={() => setViewMode('juz')}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.modeBtnText, viewMode === 'juz' && styles.modeBtnTextActive]}
          >
            30 Juz
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modeBtn}
          onPress={() => router.push('/memorize')}
          activeOpacity={0.7}
        >
          <Text style={[styles.modeBtnText, { color: COLORS.primary, fontFamily: FONTS.sansBold }]}>
            ✨ Memorize
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={
            viewMode === 'surahs'
              ? 'Search by name, meaning, or number...'
              : 'Search Juz by name or number (1 - 30)...'
          }
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips for Surahs */}
      {viewMode === 'surahs' && (
        <View style={styles.filterTabsRow}>
          {(['All', 'Meccan', 'Medinan'] as FilterType[]).map((tab) => {
            const isActive = selectedFilter === tab;
            const count =
              tab === 'All'
                ? allSurahs.length
                : allSurahs.filter((s) => s.type === tab).length;

            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedFilter(tab)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {tab} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {viewMode === 'surahs' ? (
        <FlatList
          data={filteredSurahs}
          keyExtractor={(item) => item.n.toString()}
          renderItem={({ item }) => (
            <SurahCard
              surah={item}
              isLastRead={lastRead?.surah === item.n}
              lastReadAyah={lastRead?.surah === item.n ? lastRead.ayah : undefined}
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Surahs Found</Text>
              <Text style={styles.emptySub}>Try searching with another keyword</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredJuz}
          keyExtractor={(item) => item.n.toString()}
          renderItem={({ item }) => <JuzCard juz={item} />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Juz Found</Text>
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
    paddingBottom: 110,
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
  arabicHeaderBadge: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  arabicHeaderBadgeText: {
    fontFamily: FONTS.arabicBold,
    fontSize: 16,
    color: COLORS.primaryDark,
  },
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  modeBtnActive: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  modeBtnText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  modeBtnTextActive: {
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    ...SHADOWS.sm,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.sansRegular,
    fontSize: 15,
    color: COLORS.textPrimary,
    padding: 0,
  },
  clearBtn: {
    padding: 2,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  filterChipText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.textInverse,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
