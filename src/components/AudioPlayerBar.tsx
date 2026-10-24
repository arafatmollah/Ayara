import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { useQuranAudio } from '../services/audioContext';
import { getSurahMeta } from '../services/quranData';

export const AudioPlayerBar: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { currentSurah, currentAyah, isPlaying, isBuffering, togglePlay, playNext, playPrevious, stop } =
    useQuranAudio();

  if (!currentSurah || !currentAyah) return null;

  const surahMeta = getSurahMeta(currentSurah);

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 10) + 54 }]}>
      <View style={styles.container}>
        {/* Info */}
        <View style={styles.infoCol}>
          <Text style={styles.surahTitle} numberOfLines={1}>
            {surahMeta?.en || `Surah ${currentSurah}`}
          </Text>
          <Text style={styles.ayahSub}>
            Ayah {currentAyah} of {surahMeta?.ayahs || ''}
            {isBuffering ? ' • Buffering...' : ''}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={playPrevious}
            accessibilityRole="button"
            accessibilityLabel="Previous Ayah"
          >
            <Ionicons name="play-skip-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playPauseBtn}
            onPress={togglePlay}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={22}
              color={COLORS.textInverse}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={playNext}
            accessibilityRole="button"
            accessibilityLabel="Next Ayah"
          >
            <Ionicons name="play-skip-forward" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={stop}
            accessibilityRole="button"
            accessibilityLabel="Close Audio Player"
          >
            <Ionicons name="close" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 999,
  },
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    ...SHADOWS.lg,
  },
  infoCol: {
    flex: 1,
    marginRight: 10,
  },
  surahTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  ayahSub: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
