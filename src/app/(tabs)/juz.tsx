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
import { COLORS, FONTS, SHADOWS } from '../../constants/theme';
import { getAllJuz } from '../../services/quranData';
import { JuzCard } from '../../components/JuzCard';

export default function JuzScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const allJuz = useMemo(() => getAllJuz(), []);

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
          <Text style={styles.subGreeting}>Quran Sections</Text>
          <Text style={styles.appTitle}>Thirty Juz (Ajza)</Text>
        </View>
        <View style={styles.arabicHeaderBadge}>
          <Text style={styles.arabicHeaderBadgeText}>أجزاء القرآن</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Juz by name or number (1 - 30)..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          keyboardType="default"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredJuz}
        keyExtractor={(item) => item.n.toString()}
        renderItem={({ item }) => <JuzCard juz={item} />}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  arabicHeaderBadge: {
    backgroundColor: COLORS.goldSurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },
  arabicHeaderBadgeText: {
    fontFamily: FONTS.arabicBold,
    fontSize: 17,
    color: COLORS.goldDark,
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
    marginBottom: 8,
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
});
