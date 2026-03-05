import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  PanResponder,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Slider from '@react-native-community/slider';
import GameTopBar from '../ui/components/GameTopBar';
import theme from '../ui/stylesheets/theme';
import {
  COLORING_IMAGES,
  isValidImageId,
  pickRandomImageId,
} from './coloringImages';

const COLOR_PALETTE = [
  '#FF6B6B',
  '#FFD166',
  '#4FD1C5',
  '#48BB78',
  '#4299E1',
  '#9F7AEA',
  '#F472B6',
  '#2D3748',
];

const buildPathD = (points = []) => {
  if (!points.length) return '';
  const [first, ...rest] = points;
  let d = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
  rest.forEach((p) => {
    d += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  });
  return d;
};

const ColoringBookGame = ({ onBack, initialImageId, initialDrawing, onSaveDrawing }) => {
  const [selectedId, setSelectedId] = useState(() =>
    isValidImageId(initialImageId) ? initialImageId : pickRandomImageId(),
  );
  const [strokes, setStrokes] = useState(() =>
    Array.isArray(initialDrawing?.strokes) ? initialDrawing.strokes : [],
  );
  const [canvasSize, setCanvasSize] = useState(
    initialDrawing?.canvasSize && typeof initialDrawing.canvasSize === 'object'
      ? initialDrawing.canvasSize
      : null,
  );
  const [brushSize, setBrushSize] = useState(8);
  const [activeColor, setActiveColor] = useState(COLOR_PALETTE[0]);
  const colorRef = useRef(activeColor);
  const brushRef = useRef(brushSize);
  const canvasSizeRef = useRef(
    initialDrawing?.canvasSize && typeof initialDrawing.canvasSize === 'object'
      ? initialDrawing.canvasSize
      : null,
  );

  useEffect(() => {
    colorRef.current = activeColor;
  }, [activeColor]);

  useEffect(() => {
    brushRef.current = brushSize;
  }, [brushSize]);

  useEffect(() => {
    if (isValidImageId(initialImageId)) {
      setSelectedId(initialImageId);
    }
  }, [initialImageId]);

  useEffect(() => {
    if (!initialDrawing) {
      setStrokes([]);
      setCanvasSize(null);
      canvasSizeRef.current = null;
      return;
    }
    if (Array.isArray(initialDrawing.strokes)) {
      setStrokes(initialDrawing.strokes);
    }
    if (initialDrawing.canvasSize) {
      setCanvasSize(initialDrawing.canvasSize);
      canvasSizeRef.current = initialDrawing.canvasSize;
    }
  }, [initialDrawing]);

  const selectedImage = useMemo(
    () => COLORING_IMAGES.find((img) => img.id === selectedId) || COLORING_IMAGES[0],
    [selectedId],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          setStrokes((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${prev.length}`,
              color: colorRef.current,
              width: brushRef.current,
              points: [{ x: locationX, y: locationY }],
            },
          ]);
        },
        onPanResponderMove: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          setStrokes((prev) => {
            if (!prev.length) return prev;
            const next = [...prev];
            const last = next[next.length - 1];
            const nextPoints = [...last.points, { x: locationX, y: locationY }];
            next[next.length - 1] = { ...last, points: nextPoints };
            return next;
          });
        },
      }),
    [],
  );

  const handleCanvasLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    const nextSize = { width, height };
    const prev = canvasSizeRef.current;
    const unchanged =
      prev &&
      Math.abs(prev.width - width) < 0.5 &&
      Math.abs(prev.height - height) < 0.5;
    if (unchanged) return;
    canvasSizeRef.current = nextSize;
    setCanvasSize(nextSize);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setStrokes([]);
  };

  const handleSaveAndBack = async () => {
    if (typeof onSaveDrawing !== 'function') {
      onBack?.();
      return;
    }
    // Derive a canvas size if layout info is missing; use stroke extents as fallback
    const fallbackSize = (() => {
      if (canvasSizeRef.current || canvasSize) {
        return canvasSizeRef.current || canvasSize;
      }
      let maxX = 0;
      let maxY = 0;
      strokes.forEach((stroke) => {
        (stroke.points || []).forEach((p) => {
          if (typeof p.x === 'number') maxX = Math.max(maxX, p.x);
          if (typeof p.y === 'number') maxY = Math.max(maxY, p.y);
        });
      });
      if (maxX === 0 && maxY === 0) return null;
      return { width: Math.max(1, Math.ceil(maxX)), height: Math.max(1, Math.ceil(maxY)) };
    })();

    try {
      await onSaveDrawing(selectedId, {
        strokes,
        canvasSize: canvasSizeRef.current || canvasSize || fallbackSize,
        updatedAt: Date.now(),
      });
      onBack?.();
    } catch (error) {
      console.warn('Failed to save coloring progress', error);
      Alert.alert('Save failed', 'Something went wrong while saving. Please try again.');
    }
  };

  return (
    <LinearGradient colors={['#120C2C', '#1A1F3F']} style={styles.gradient}>
      <GameTopBar title="Color In" onBack={onBack} />

      <View style={styles.content}>
        <View style={styles.canvasCard} {...panResponder.panHandlers} onLayout={handleCanvasLayout}>
          <Image
            source={selectedImage.source}
            resizeMode="contain"
            style={styles.image}
            blurRadius={0}
          />
          <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
            {strokes.map((stroke) => (
              <Path
                key={stroke.id}
                d={buildPathD(stroke.points)}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
          </Svg>
        </View>

        <View style={styles.paletteBar}>
          <Text style={styles.sectionLabel}>Palette</Text>
          <View style={styles.paletteRow}>
            {COLOR_PALETTE.map((swatch) => {
              const selected = swatch === activeColor;
              return (
                <TouchableOpacity
                  key={swatch}
                  onPress={() => setActiveColor(swatch)}
                  style={[
                    styles.swatch,
                    { backgroundColor: swatch },
                    selected && styles.swatchSelected,
                  ]}
                  activeOpacity={0.9}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.controlsCard}>
          <Text style={styles.sectionLabel}>Brush</Text>
          <View style={styles.sliderRow}>
            <Slider
              minimumValue={2}
              maximumValue={22}
              step={1}
              minimumTrackTintColor={activeColor}
              maximumTrackTintColor="#4B5563"
              thumbTintColor={activeColor}
              value={brushSize}
              onValueChange={setBrushSize}
              style={styles.slider}
            />
            <View style={[styles.brushPreview, { backgroundColor: activeColor }]}>
              <View style={{ width: brushSize, height: brushSize, borderRadius: brushSize / 2, backgroundColor: theme.whiteColor }} />
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity onPress={handleUndo} style={styles.actionButton}>
              <Text style={styles.actionText}>Undo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClear} style={styles.actionButton}>
              <Text style={styles.actionText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSaveAndBack} style={styles.primaryActionButton}>
              <Text style={styles.primaryActionText}>Save & Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default ColoringBookGame;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 88,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  canvasCard: {
    flex: 1.25,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#0C1226',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.92,
  },
  controlsCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  sectionLabel: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slider: {
    flex: 1,
  },
  brushPreview: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  swatchSelected: {
    borderColor: '#F9FAFB',
    transform: [{ scale: 1.05 }],
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
  },
  primaryActionButton: {
    flex: 1.4,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  actionText: {
    color: '#E5E7EB',
    fontSize: 15,
    fontWeight: '600',
  },
  primaryActionText: {
    color: theme.whiteColor,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  paletteBar: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
});
