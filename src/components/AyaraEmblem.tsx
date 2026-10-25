import React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  G,
  Circle,
  Line,
  Polygon,
} from 'react-native-svg';

interface AyaraEmblemProps {
  size?: number;
  glowOpacity?: number;
  strokeWidth?: number;
}

export const AyaraEmblem: React.FC<AyaraEmblemProps> = ({
  size = 180,
  glowOpacity = 1,
  strokeWidth = 3.2,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">
      <Defs>
        {/* Playful Sunset Amethyst Gradient */}
        <LinearGradient id="ayaraArchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F59E0B" stopOpacity="1" />
          <Stop offset="30%" stopColor="#8B5CF6" stopOpacity="1" />
          <Stop offset="100%" stopColor="#6D28D9" stopOpacity="1" />
        </LinearGradient>

        {/* Playful Inner Arch Foil Gradient */}
        <LinearGradient id="ayaraInnerGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <Stop offset="0%" stopColor="#FBBF24" stopOpacity="1" />
          <Stop offset="50%" stopColor="#A78BFA" stopOpacity="1" />
          <Stop offset="100%" stopColor="#7C3AED" stopOpacity="1" />
        </LinearGradient>

        {/* Soft Sunny Lavender Inner Arch Glow */}
        <RadialGradient id="ayaraPlayfulArchGlow" cx="50%" cy="40%" r="55%">
          <Stop offset="0%" stopColor="#FEF3C7" stopOpacity={0.85 * glowOpacity} />
          <Stop offset="55%" stopColor="#EDE9FE" stopOpacity={0.6 * glowOpacity} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>

        {/* Outer Radiant Ambient Halo (Soft Pastel Glow on White) */}
        <RadialGradient id="ayaraPlayfulBackGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#EDE9FE" stopOpacity={0.75 * glowOpacity} />
          <Stop offset="45%" stopColor="#FEF3C7" stopOpacity={0.45 * glowOpacity} />
          <Stop offset="80%" stopColor="#D1FAE5" stopOpacity={0.25 * glowOpacity} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>

        {/* Pure Quran Page Shadow / Depth Gradient */}
        <LinearGradient id="ayaraPageDepth" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#F5F3FF" stopOpacity="1" />
          <Stop offset="100%" stopColor="#E9D5FF" stopOpacity="1" />
        </LinearGradient>

        {/* Gilded Gold Foil Edge for Book */}
        <LinearGradient id="ayaraGoldFoil" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#F59E0B" stopOpacity="1" />
          <Stop offset="50%" stopColor="#FDE68A" stopOpacity="1" />
          <Stop offset="100%" stopColor="#D97706" stopOpacity="1" />
        </LinearGradient>

        {/* Rehl Wooden Stand Gradient */}
        <LinearGradient id="ayaraRehlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#4C1D95" stopOpacity="1" />
          <Stop offset="100%" stopColor="#2E1065" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Atmospheric Playful Pastel Halo */}
      <Circle cx="120" cy="120" r="105" fill="url(#ayaraPlayfulBackGlow)" />

      {/* Celestial Rays & Twinkling Sparkles */}
      <G opacity={glowOpacity}>
        {/* Soft playful upward radiance rays */}
        <Line x1="120" y1="46" x2="120" y2="24" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
        <Line x1="138" y1="50" x2="150" y2="30" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
        <Line x1="102" y1="50" x2="90" y2="30" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
        <Line x1="156" y1="60" x2="174" y2="44" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
        <Line x1="84" y1="60" x2="66" y2="44" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
        <Line x1="172" y1="78" x2="192" y2="64" stroke="#A78BFA" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        <Line x1="68" y1="78" x2="48" y2="64" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />

        {/* Twinkling 4-Point Sparkle Stars */}
        {/* Top Center Gold Star */}
        <Polygon points="120,14 122,19 127,21 122,23 120,28 118,23 113,21 118,19" fill="#F59E0B" />
        {/* Upper Left Violet Star */}
        <Polygon points="74,32 75.5,35 79,36.5 75.5,38 74,41 72.5,38 69,36.5 72.5,35" fill="#8B5CF6" />
        {/* Upper Right Mint Star */}
        <Polygon points="166,32 167.5,35 171,36.5 167.5,38 166,41 164.5,38 161,36.5 164.5,35" fill="#10B981" />

        {/* Playful Floating Celestial Dots */}
        <Circle cx="144" cy="22" r="2.2" fill="#FBBF24" />
        <Circle cx="96" cy="22" r="2.2" fill="#A78BFA" />
        <Circle cx="184" cy="52" r="1.8" fill="#10B981" />
        <Circle cx="56" cy="52" r="1.8" fill="#F59E0B" />
        <Circle cx="196" cy="95" r="2" fill="#8B5CF6" />
        <Circle cx="44" cy="95" r="2" fill="#F59E0B" />
      </G>

      {/* Islamic Arch (Mihrab) Structure */}
      {/* Arch Warm Pastel Fill */}
      <Path
        d="M 86 142 L 86 108 C 86 86, 102 70, 120 52 C 138 70, 154 86, 154 108 L 154 142 Z"
        fill="url(#ayaraPlayfulArchGlow)"
      />

      {/* Outer Pointed Islamic Arch (Vibrant Sunset Amethyst) */}
      <Path
        d="M 78 150 L 78 106 C 78 78, 100 62, 120 44 C 140 62, 162 78, 162 106 L 162 150"
        stroke="url(#ayaraArchGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Inner Moorish Foiled Arch Line */}
      <Path
        d="M 88 144 L 88 112 C 88 96, 96 90, 104 82 C 112 74, 116 68, 120 60 C 124 68, 128 74, 136 82 C 144 90, 152 96, 152 112 L 152 144"
        stroke="url(#ayaraInnerGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Arch Peak Golden Radiant Diamond */}
      <Polygon points="120,68 124,74 120,80 116,74" fill="#F59E0B" />
      <Circle cx="120" cy="74" r="1.5" fill="#FFFFFF" />

      {/* Open Sacred Quran Book */}
      {/* Base Depth Silhouette / Rehl Back */}
      <Path
        d="M 120 162 L 54 138 L 54 152 L 120 178 L 186 152 L 186 138 Z"
        fill="url(#ayaraPageDepth)"
        stroke="#DDD6FE"
        strokeWidth="1"
      />

      {/* Quran Pages - Left Spread */}
      <Path
        d="M 120 156 C 98 146, 68 140, 46 144 L 46 130 C 70 126, 98 132, 120 142 Z"
        fill="#FFFFFF"
        stroke="url(#ayaraGoldFoil)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Quran Pages - Right Spread */}
      <Path
        d="M 120 156 C 142 146, 172 140, 194 144 L 194 130 C 170 126, 142 132, 120 142 Z"
        fill="#FFFFFF"
        stroke="url(#ayaraGoldFoil)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Delicate Quranic Page Lines (Left Page) */}
      <Path
        d="M 58 136 C 76 133, 98 138, 114 145"
        stroke="#EDE9FE"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M 60 141 C 78 138, 98 143, 114 150"
        stroke="#EDE9FE"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Delicate Quranic Page Lines (Right Page) */}
      <Path
        d="M 182 136 C 164 133, 142 138, 126 145"
        stroke="#EDE9FE"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M 180 141 C 162 138, 142 143, 126 150"
        stroke="#EDE9FE"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Golden Bookmark Ribbon flowing playfully down from spine */}
      <Path
        d="M 120 142 Q 123 154, 118 166 Q 115 174, 121 180 L 120 183 L 115 178 Q 111 172, 114 165 Q 119 154, 118 142 Z"
        fill="url(#ayaraGoldFoil)"
      />

      {/* Book Spine Center Marker */}
      <Line
        x1="120"
        y1="142"
        x2="120"
        y2="176"
        stroke="#7C3AED"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Stand Leg (Rehl) - Left Crossing */}
      <Path
        d="M 120 174 L 88 198 L 76 192 L 108 168"
        fill="url(#ayaraRehlGrad)"
        stroke="#8B5CF6"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Stand Leg (Rehl) - Right Crossing */}
      <Path
        d="M 120 174 L 152 198 L 164 192 L 132 168"
        fill="url(#ayaraRehlGrad)"
        stroke="#8B5CF6"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Golden Jewel Stud Accents on Rehl Joint */}
      <Circle cx="120" cy="142" r="3" fill="#F59E0B" />
      <Circle cx="120" cy="142" r="1.3" fill="#FFFFFF" />
      <Circle cx="120" cy="174" r="2.5" fill="#F59E0B" />
      <Circle cx="120" cy="174" r="1" fill="#FFFFFF" />
    </Svg>
  );
};
