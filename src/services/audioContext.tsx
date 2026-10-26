import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { getSurahMeta } from './quranData';
import { getReaderSettings, saveReaderSettings } from './storage';

export interface ReciterInfo {
  id: string;
  name: string;
  subname: string;
  bitrate: string;
  riwayah: string;
  source: string;
  provenance: string;
}

export const RECITERS_LIST: ReciterInfo[] = [
  {
    id: 'Alafasy_128kbps',
    name: 'Mishary Rashid Alafasy',
    subname: 'Murattal (Kuwait)',
    bitrate: '128 kbps',
    riwayah: "Hafs 'an 'Asim",
    source: 'EveryAyah.com Verified Archive',
    provenance: 'High-clarity studio recitation supervised by Qurra in Kuwait',
  },
  {
    id: 'Abdul_Basit_Murattal_192kbps',
    name: 'AbdulBaset AbdulSamad',
    subname: 'Murattal (Egypt)',
    bitrate: '192 kbps',
    riwayah: "Hafs 'an 'Asim",
    source: 'EveryAyah.com Verified Archive',
    provenance: 'Canonical Egyptian Radio standard recitation recording',
  },
  {
    id: 'Maher_AlMuaiqly_64kbps',
    name: 'Maher Al-Muaiqly',
    subname: 'Masjid al-Haram',
    bitrate: '64 kbps',
    riwayah: "Hafs 'an 'Asim",
    source: 'EveryAyah.com Verified Archive',
    provenance: 'Imam of Masjid al-Haram, Makkah al-Mukarramah',
  },
  {
    id: 'Abu_Bakr_Ash-Shaatree_128kbps',
    name: 'Abu Bakr Al-Shatri',
    subname: 'Jeddah',
    bitrate: '128 kbps',
    riwayah: "Hafs 'an 'Asim",
    source: 'EveryAyah.com Verified Archive',
    provenance: 'Renowned Saudi Qari with melodious murattal style',
  },
  {
    id: 'Husary_128kbps',
    name: 'Mahmoud Khalil Al-Husary',
    subname: 'Master of Tajweed',
    bitrate: '128 kbps',
    riwayah: "Hafs 'an 'Asim",
    source: 'EveryAyah.com Verified Archive',
    provenance: 'Authoritative gold standard of Tajweed rules and articulation',
  },
];

interface AudioContextType {
  currentSurah: number | null;
  currentAyah: number | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  reciter: string;
  setReciter: (id: string) => void;
  playAyah: (surah: number, ayah: number) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  stop: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

const pad3 = (n: number) => String(n).padStart(3, '0');

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentSurah, setCurrentSurah] = useState<number | null>(null);
  const [currentAyah, setCurrentAyah] = useState<number | null>(null);
  const [reciter, setReciterState] = useState<string>('Alafasy_128kbps');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const player = useAudioPlayer(audioUrl);
  const status = useAudioPlayerStatus(player);

  const isTransitioningRef = useRef(false);
  const stateRef = useRef({ currentSurah, currentAyah, reciter });

  useEffect(() => {
    stateRef.current = { currentSurah, currentAyah, reciter };
  }, [currentSurah, currentAyah, reciter]);

  useEffect(() => {
    getReaderSettings().then((s) => {
      if (s.reciter) setReciterState(s.reciter);
    });
  }, []);

  const playAyahWithReciter = (surah: number, ayah: number, activeReciter: string) => {
    isTransitioningRef.current = true;
    setCurrentSurah(surah);
    setCurrentAyah(ayah);
    const url = `https://everyayah.com/data/${activeReciter}/${pad3(surah)}${pad3(ayah)}.mp3`;
    setAudioUrl(url);

    if (player) {
      player.replace(url);
      player.play();
    }
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 400);
  };

  const setReciter = (id: string) => {
    setReciterState(id);
    saveReaderSettings({ reciter: id });
    if (currentSurah && currentAyah && status.playing) {
      playAyahWithReciter(currentSurah, currentAyah, id);
    }
  };

  const playAyah = (surah: number, ayah: number) => {
    playAyahWithReciter(surah, ayah, reciter);
  };

  const togglePlay = () => {
    if (!player) return;
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const stop = () => {
    if (player) {
      player.pause();
    }
    setCurrentSurah(null);
    setCurrentAyah(null);
    setAudioUrl(null);
  };

  const playNext = () => {
    if (!currentSurah || !currentAyah) return;
    const meta = getSurahMeta(currentSurah);
    if (!meta) return;

    if (currentAyah < meta.ayahs) {
      playAyah(currentSurah, currentAyah + 1);
    } else if (currentSurah < 114) {
      playAyah(currentSurah + 1, 1);
    } else {
      stop();
    }
  };

  const playPrevious = () => {
    if (!currentSurah || !currentAyah) return;
    if (currentAyah > 1) {
      playAyah(currentSurah, currentAyah - 1);
    } else if (currentSurah > 1) {
      const prevMeta = getSurahMeta(currentSurah - 1);
      if (prevMeta) {
        playAyah(currentSurah - 1, prevMeta.ayahs);
      }
    }
  };

  const playAyahWithReciterRef = useRef(playAyahWithReciter);
  const stopRef = useRef(stop);

  useEffect(() => {
    playAyahWithReciterRef.current = playAyahWithReciter;
    stopRef.current = stop;
  });

  // Handle auto-advance when ayah finishes
  useEffect(() => {
    if (status.didJustFinish && !isTransitioningRef.current) {
      const { currentSurah: s, currentAyah: a, reciter: r } = stateRef.current;
      if (s && a) {
        const meta = getSurahMeta(s);
        if (meta && a < meta.ayahs) {
          playAyahWithReciterRef.current(s, a + 1, r);
        } else {
          stopRef.current();
        }
      }
    }
  }, [status.didJustFinish]);

  return (
    <AudioContext.Provider
      value={{
        currentSurah,
        currentAyah,
        isPlaying: status.playing,
        isBuffering: status.isBuffering,
        currentTime: status.currentTime,
        duration: status.duration,
        reciter,
        setReciter,
        playAyah,
        togglePlay,
        playNext,
        playPrevious,
        stop,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useQuranAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useQuranAudio must be used within an AudioProvider');
  }
  return context;
}
