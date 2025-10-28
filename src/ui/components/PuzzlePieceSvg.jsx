import React, { useMemo } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, ClipPath, G, Rect } from 'react-native-svg';
import themeVariables from '../stylesheets/theme';
import { buildJigsawPath } from './PuzzlePath';

const PuzzlePieceSvg = ({ word, connectors, pan, panResponder, placed, size, isActive }) => {
  const gradId = useMemo(() => `grad_${Math.random().toString(36).slice(2)}`, []);
  const clipId = useMemo(() => `clip_${Math.random().toString(36).slice(2)}`, []);
  const stripeGradId = useMemo(() => `sgrad_${Math.random().toString(36).slice(2)}`, []);
  const pieceFill = `url(#${gradId})`;
  const knobRatio = 0.22;
  const pad = Math.round(size * knobRatio);
  const d = buildJigsawPath(size, connectors, knobRatio);

  return (
    <Animated.View
      {...(panResponder && panResponder.panHandlers)}
      style={[
        styles.container,
        { width: size, height: size },
        // Layering: active on top, then unplaced, then set pieces
        { zIndex: isActive ? 100 : placed ? 1 : 10, elevation: isActive ? 12 : placed ? 1 : 5 },
        { transform: pan.getTranslateTransform() },
      ]}
      pointerEvents={placed ? 'none' : 'auto'}
    >
      <View style={styles.svgWrap}>
        <Svg
          width={size + 2 * pad}
          height={size + 2 * pad}
          viewBox={`${-pad} ${-pad} ${size + 2 * pad} ${size + 2 * pad}`}
          style={{ position: 'absolute', left: -pad, top: -pad }}
        >
          <Defs>
            {/* Wood base gradient: lighter top-left to mid bottom-right */}
            <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={themeVariables.woodLight} stopOpacity={1} />
              <Stop offset="100%" stopColor={themeVariables.woodMid} stopOpacity={placed ? 1 : 0.95} />
            </LinearGradient>
            <ClipPath id={clipId}>
              <Path d={d} />
            </ClipPath>
            {/* Subtle wood grain highlight */}
            <LinearGradient id={stripeGradId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={themeVariables.woodDark} stopOpacity="0.08" />
              <Stop offset="100%" stopColor={themeVariables.woodDark} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          {/* Base piece fill with wood gradient */}
          <Path
            d={d}
            fill={pieceFill}
            stroke={themeVariables.woodDark}
            strokeWidth={1}
          />
          {/* Clip decorative stripes to puzzle shape for texture */}
          <G clipPath={`url(#${clipId})`}>
            {Array.from({ length: 14 }).map((_, i) => (
              <Rect
                key={i}
                x={-pad - size}
                y={-pad + i * Math.max(8, size * 0.1)}
                width={size * 3}
                height={4}
                fill={`url(#${stripeGradId})`}
                transform={`rotate(-15 ${size / 2} ${size / 2})`}
              />
            ))}
          </G>
        </Svg>
        <Text
          style={[
            styles.word,
            placed && styles.placedWord,
            { width: Math.round(size * 0.86) },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
          ellipsizeMode="tail"
        >
          {word}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 1.5,
    elevation: 3,
  },
  svgWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    position: 'absolute',
    paddingHorizontal: 4,
    color: themeVariables.blackColor,
    textAlign: 'center',
  },
  placedWord: {
    color: themeVariables.blackColor,
  },
});

export default PuzzlePieceSvg;
