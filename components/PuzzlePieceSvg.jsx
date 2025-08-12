import React, { useMemo } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, ClipPath, G, Rect } from 'react-native-svg';
import themeVariables from '../styles/theme';
import { buildJigsawPath } from './PuzzlePath';

const PuzzlePieceSvg = ({ word, connectors, pan, panResponder, placed, size }) => {
  const gradId = useMemo(() => `grad_${Math.random().toString(36).slice(2)}`, []);
  const clipId = useMemo(() => `clip_${Math.random().toString(36).slice(2)}`, []);
  const stripeGradId = useMemo(() => `sgrad_${Math.random().toString(36).slice(2)}`, []);
  const pieceFill = `url(#${gradId})`;
  const stroke = themeVariables.primaryColor;
  const knobRatio = 0.22;
  const pad = Math.round(size * knobRatio);
  const d = buildJigsawPath(size, connectors, knobRatio);

  return (
    <Animated.View
      {...(panResponder && panResponder.panHandlers)}
      style={[
        styles.container,
        { width: size, height: size },
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
            <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              {placed ? (
                <>
                  <Stop offset="0%" stopColor={themeVariables.primaryLightColor} stopOpacity="1" />
                  <Stop offset="100%" stopColor={themeVariables.primaryColor} stopOpacity="1" />
                </>
              ) : (
                <>
                  <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#f0f0f3" stopOpacity="1" />
                </>
              )}
            </LinearGradient>
            <ClipPath id={clipId}>
              <Path d={d} />
            </ClipPath>
            <LinearGradient id={stripeGradId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
              <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          {/* Base piece fill with subtle gradient */}
          <Path d={d} fill={pieceFill} stroke={stroke} strokeWidth={1} />
          {/* Clip decorative stripes to puzzle shape for texture */}
          <G clipPath={`url(#${clipId})`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Rect
                key={i}
                x={-pad - size}
                y={-pad + i * Math.max(10, size * 0.12)}
                width={size * 3}
                height={6}
                fill={`url(#${stripeGradId})`}
                transform={`rotate(-18 ${size / 2} ${size / 2})`}
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
  },
  svgWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    position: 'absolute',
    paddingHorizontal: 4,
    color: themeVariables.primaryColor,
    textAlign: 'center',
  },
  placedWord: {
    color: themeVariables.whiteColor,
  },
});

export default PuzzlePieceSvg;
