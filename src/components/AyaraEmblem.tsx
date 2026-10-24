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
} from 'react-native-svg';

interface AyaraEmblemProps {
  size?: number;
  glowOpacity?: number;
  strokeWidth?: number;
}

export const AyaraEmblem: React.FC<AyaraEmblemProps> = ({
  size = 180,
  glowOpacity = 1,
  strokeWidth = 3,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">
      <Defs>
        {/* Violet to Lavender Radiant Gradient */}
        <LinearGradient id="ayaraLavGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <Stop offset="25%" stopColor="#EDE9FE" stopOpacity="1" />
          <Stop offset="65%" stopColor="#C4B5FD" stopOpacity="1" />
          <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.9" />
        </LinearGradient>

        {/* Deep Violet Shading */}
        <LinearGradient id="ayaraDeepViolet" x1="50%" y1="0%" x2="50%" y2="100%">
          <Stop offset="0%" stopColor="#6D28D9" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#2E1065" stopOpacity="0.95" />
        </LinearGradient>

        {/* Arch Inner Glow */}
        <RadialGradient id="ayaraArchGlow" cx="50%" cy="45%" r="50%">
          <Stop offset="0%" stopColor="#DDD6FE" stopOpacity={0.6 * glowOpacity} />
          <Stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.3 * glowOpacity} />
          <Stop offset="100%" stopColor="#1E0B36" stopOpacity="0" />
        </RadialGradient>

        {/* Ambient Back Glow */}
        <RadialGradient id="ayaraBackGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#A78BFA" stopOpacity={0.35 * glowOpacity} />
          <Stop offset="60%" stopColor="#5B21B6" stopOpacity={0.15 * glowOpacity} />
          <Stop offset="100%" stopColor="#0D0714" stopOpacity="0" />
        </RadialGradient>

        {/* Gold / Silver Subtle Accent Gradient */}
        <LinearGradient id="ayaraSilverAccent" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.7" />
          <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#A78BFA" stopOpacity="0.7" />
        </LinearGradient>
      </Defs>

      {/* Atmospheric Background Glow */}
      <Circle cx="120" cy="120" r="105" fill="url(#ayaraBackGlow)" />

      {/* Radiant Light Rays emanating upwards from Arch */}
      <G opacity={glowOpacity}>
        {/* Center top rays */}
        <Line x1="120" y1="48" x2="120" y2="28" stroke="#DDD6FE" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <Line x1="138" y1="52" x2="148" y2="34" stroke="#DDD6FE" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <Line x1="102" y1="52" x2="92" y2="34" stroke="#DDD6FE" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <Line x1="156" y1="62" x2="172" y2="46" stroke="#C4B5FD" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <Line x1="84" y1="62" x2="68" y2="46" stroke="#C4B5FD" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <Line x1="170" y1="78" x2="190" y2="66" stroke="#A78BFA" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        <Line x1="70" y1="78" x2="50" y2="66" stroke="#A78BFA" strokeWidth="1" strokeLinecap="round" opacity="0.5" />

        {/* Delicate celestial sparkles */}
        <Circle cx="120" cy="22" r="1.5" fill="#FFFFFF" opacity="0.9" />
        <Circle cx="145" cy="26" r="1.2" fill="#EDE9FE" opacity="0.8" />
        <Circle cx="95" cy="26" r="1.2" fill="#EDE9FE" opacity="0.8" />
        <Circle cx="168" cy="38" r="1" fill="#C4B5FD" opacity="0.7" />
        <Circle cx="72" cy="38" r="1" fill="#C4B5FD" opacity="0.7" />
      </G>

      {/* Islamic Arch (Mihrab) Structure */}
      {/* Arch Inner Glow field */}
      <Path
        d="M 86 140 L 86 108 C 86 86, 102 72, 120 54 C 138 72, 154 86, 154 108 L 154 140 Z"
        fill="url(#ayaraArchGlow)"
      />

      {/* Outer Islamic Pointed Arch Frame */}
      <Path
        d="M 80 148 L 80 106 C 80 80, 100 64, 120 46 C 140 64, 160 80, 160 106 L 160 148"
        stroke="url(#ayaraLavGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Inner Moorish Foiled Arch Line */}
      <Path
        d="M 90 144 L 90 112 C 90 98, 97 92, 104 84 C 112 76, 116 70, 120 62 C 124 70, 128 76, 136 84 C 143 92, 150 98, 150 112 L 150 144"
        stroke="#DDD6FE"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
        fill="none"
      />

      {/* Central Radiance Diamond in Arch Peak */}
      <Path
        d="M 120 72 L 123 78 L 120 84 L 117 78 Z"
        fill="#FFFFFF"
        opacity="0.9"
      />

      {/* Open Sacred Quran Book */}
      {/* Base Depth Silhouette */}
      <Path
        d="M 120 162 L 56 138 L 56 154 L 120 178 L 184 154 L 184 138 Z"
        fill="url(#ayaraDeepViolet)"
        opacity="0.95"
      />

      {/* Quran Pages - Left Spread */}
      <Path
        d="M 120 158 C 98 148, 68 142, 48 146 L 48 132 C 70 128, 98 134, 120 144 Z"
        fill="url(#ayaraLavGradient)"
      />

      {/* Quran Pages - Right Spread */}
      <Path
        d="M 120 158 C 142 148, 172 142, 192 146 L 192 132 C 170 128, 142 134, 120 144 Z"
        fill="url(#ayaraLavGradient)"
      />

      {/* Inner Layered Page Highlights (Left) */}
      <Path
        d="M 118 152 C 98 144, 74 138, 56 141 L 56 135 C 74 132, 98 138, 118 146 Z"
        fill="#FFFFFF"
        opacity="0.65"
      />

      {/* Inner Layered Page Highlights (Right) */}
      <Path
        d="M 122 152 C 142 144, 166 138, 184 141 L 184 135 C 166 132, 142 138, 122 146 Z"
        fill="#FFFFFF"
        opacity="0.65"
      />

      {/* Book Spine and Rehl (Wooden Stand) Base Support */}
      <Path
        d="M 120 144 L 120 184"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Stand Leg - Left Crossing */}
      <Path
        d="M 120 174 L 88 198 L 78 192 L 110 168"
        fill="url(#ayaraDeepViolet)"
        stroke="url(#ayaraLavGradient)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Stand Leg - Right Crossing */}
      <Path
        d="M 120 174 L 152 198 L 162 192 L 130 168"
        fill="url(#ayaraDeepViolet)"
        stroke="url(#ayaraLavGradient)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Golden / Silver Central Jewel Accent */}
      <Circle cx="120" cy="144" r="2.8" fill="#FFFFFF" />
      <Circle cx="120" cy="174" r="2.2" fill="#EDE9FE" />
    </Svg>
  );
};
