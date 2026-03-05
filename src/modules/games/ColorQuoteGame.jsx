import React, { useMemo, useRef, useState } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import Svg, { Rect, Circle, Ellipse } from 'react-native-svg';
import GameTopBar from '../../ui/components/GameTopBar';
import themeVariables from '../../ui/stylesheets/theme';

const PALETTE = [
  { key: 'sun', label: 'Sun', color: '#f9c74f' },
  { key: 'sky', label: 'Sky', color: '#4ea8de' },
  { key: 'leaf', label: 'Leaf', color: '#6ab04c' },
  { key: 'heart', label: 'Heart', color: '#e05656' },
  { key: 'violet', label: 'Violet', color: '#9b59b6' },
  { key: 'ocean', label: 'Ocean', color: '#1f78b4' },
];

const ZONES = [
  { id: 'sky', label: 'Sky', kind: 'rect', x: 0, y: 0, width: 300, height: 95, rx: 0 },
  { id: 'sun', label: 'Sun', kind: 'circle', cx: 240, cy: 55, r: 28 },
  { id: 'treeTop', label: 'Tree Top', kind: 'ellipse', cx: 85, cy: 130, rx: 42, ry: 34 },
  { id: 'treeTrunk', label: 'Tree Trunk', kind: 'rect', x: 72, y: 140, width: 26, height: 58, rx: 4 },
  { id: 'ground', label: 'Ground', kind: 'rect', x: 0, y: 205, width: 300, height: 55, rx: 0 },
  { id: 'path', label: 'Path', kind: 'ellipse', cx: 180, cy: 210, rx: 66, ry: 22 },
];

const normalizeWords = quote => {
  const raw = typeof quote === 'string' ? quote : quote?.text || '';
  return raw
    .split(/\s+/)
    .map(word => word.trim())
    .map(word => word.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, ''))
    .filter(Boolean);
};

const uniqueWords = (words = []) => {
  const seen = new Set();
  const out = [];
  words.forEach(word => {
    const key = word.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(word);
  });
  return out;
};

const getWordCountForLevel = level => {
  if (level >= 3) return 6;
  if (level === 2) return 5;
  return 4;
};

const ZoneShape = ({ zone, fill, stroke, onPress }) => {
  const commonProps = {
    fill,
    stroke,
    strokeWidth: 2,
    onPress,
  };

  if (zone.kind === 'circle') {
    return <Circle {...commonProps} cx={zone.cx} cy={zone.cy} r={zone.r} />;
  }

  if (zone.kind === 'ellipse') {
    return <Ellipse {...commonProps} cx={zone.cx} cy={zone.cy} rx={zone.rx} ry={zone.ry} />;
  }

  return (
    <Rect
      {...commonProps}
      x={zone.x}
      y={zone.y}
      width={zone.width}
      height={zone.height}
      rx={zone.rx || 0}
    />
  );
};

const ColorQuoteGame = ({ quote, onBack, onWin, level = 1 }) => {
  const words = useMemo(() => normalizeWords(quote), [quote]);
  const targets = useMemo(() => {
    const count = getWordCountForLevel(level);
    return uniqueWords(words).slice(0, count);
  }, [words, level]);

  const activeZones = useMemo(() => ZONES.slice(0, Math.max(targets.length, 1)), [targets.length]);

  const colorMap = useMemo(() => {
    const map = {};
    targets.forEach((word, index) => {
      map[word.toLowerCase()] = PALETTE[index % PALETTE.length];
    });
    return map;
  }, [targets]);

  const zoneWordMap = useMemo(() => {
    const map = {};
    activeZones.forEach((zone, index) => {
      map[zone.id] = targets[index] || targets[targets.length - 1] || null;
    });
    return map;
  }, [activeZones, targets]);

  const [selectedColorKey, setSelectedColorKey] = useState(PALETTE[0].key);
  const [paintedZones, setPaintedZones] = useState({});
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState('Choose a colour, then paint the matching scene zone.');
  const [completed, setCompleted] = useState(false);

  const paintPopAnim = useRef(new Animated.Value(1)).current;
  const celebrateFadeAnim = useRef(new Animated.Value(0)).current;

  const selectedColor = PALETTE.find(entry => entry.key === selectedColorKey) || PALETTE[0];

  const handlePaintZone = zone => {
    if (completed) return;

    const word = zoneWordMap[zone.id];
    if (!word) return;

    const expected = colorMap[word.toLowerCase()];
    if (!expected) return;

    if (selectedColor.key !== expected.key) {
      setMistakes(value => value + 1);
      setMessage(`Try again: “${word}” matches ${expected.label}.`);
      return;
    }

    const nextPaintedZones = {
      ...paintedZones,
      [zone.id]: true,
    };

    setPaintedZones(nextPaintedZones);
    setMessage(`Great! You painted “${word}” with ${expected.label}.`);

    paintPopAnim.setValue(0.96);
    Animated.spring(paintPopAnim, {
      toValue: 1,
      friction: 4,
      tension: 120,
      useNativeDriver: true,
    }).start();

    const allDone = activeZones.every(entry => nextPaintedZones[entry.id]);
    if (allDone) {
      setCompleted(true);
      setMessage('Beautiful! You coloured the whole quote scene.');
      Animated.timing(celebrateFadeAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
      onWin?.({ perfect: mistakes === 0 });
    }
  };

  const paintedCount = activeZones.filter(zone => paintedZones[zone.id]).length;

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />

      <Text style={styles.title}>Colour the Quote</Text>
      <Text style={styles.subtitle}>Paint the scene using the colours linked to the lesson words.</Text>

      <View style={styles.progressRow}>
        <Text style={styles.progressText}>Progress: {paintedCount}/{activeZones.length}</Text>
        <Text style={styles.progressText}>Mistakes: {mistakes}</Text>
      </View>

      <Animated.View style={[styles.canvasCard, { transform: [{ scale: paintPopAnim }] }]}> 
        <Svg width="100%" height="100%" viewBox="0 0 300 260">
          {activeZones.map(zone => {
            const word = zoneWordMap[zone.id];
            const expected = word ? colorMap[word.toLowerCase()] : null;
            const isPainted = paintedZones[zone.id];
            const fill = isPainted && expected ? expected.color : 'rgba(255,255,255,0.12)';

            return (
              <ZoneShape
                key={zone.id}
                zone={zone}
                fill={fill}
                stroke="rgba(255,255,255,0.85)"
                onPress={() => handlePaintZone(zone)}
              />
            );
          })}
        </Svg>
        {completed ? (
          <Animated.View pointerEvents="none" style={[styles.celebrateOverlay, { opacity: celebrateFadeAnim }]}> 
            <LottieView
              source={require('../../assets/animations/sparkle.json')}
              autoPlay
              loop={false}
              style={styles.sparkleAnimation}
            />
          </Animated.View>
        ) : null}
      </Animated.View>

      <View style={styles.paletteRow}>
        {PALETTE.slice(0, Math.max(targets.length, 4)).map(entry => {
          const active = entry.key === selectedColor.key;
          return (
            <TouchableOpacity
              key={entry.key}
              onPress={() => setSelectedColorKey(entry.key)}
              style={[styles.swatch, { backgroundColor: entry.color }, active && styles.swatchActive]}
            >
              <Text style={styles.swatchLabel}>{entry.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.legendWrap}>
        {activeZones.map(zone => {
          const word = zoneWordMap[zone.id];
          const expected = word ? colorMap[word.toLowerCase()] : null;
          return (
            <View key={`legend-${zone.id}`} style={styles.legendChip}>
              <View style={[styles.legendDot, { backgroundColor: expected?.color || '#999' }]} />
              <Text style={styles.legendText}>{zone.label} → {word || '—'}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.message}>{message}</Text>
      <Text style={styles.hint}>Tip: tap scene zones, not words, to paint.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    marginTop: 8,
    fontSize: 28,
    color: themeVariables.whiteColor,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 10,
    fontSize: 14,
    color: themeVariables.whiteColor,
    textAlign: 'center',
  },
  progressRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressText: {
    color: themeVariables.whiteColor,
    fontSize: 13,
    fontWeight: '600',
  },
  canvasCard: {
    width: '100%',
    maxWidth: 360,
    aspectRatio: 1.15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  celebrateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleAnimation: {
    width: '100%',
    height: '100%',
  },
  paletteRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 10,
  },
  swatch: {
    minWidth: 78,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  swatchActive: {
    borderColor: '#ffffff',
  },
  swatchLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  legendWrap: {
    width: '100%',
    gap: 6,
    marginBottom: 8,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  message: {
    marginTop: 4,
    color: themeVariables.whiteColor,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    fontSize: 12,
  },
});

export default ColorQuoteGame;
