import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import GameTopBar from '../../ui/components/GameTopBar';
import { COLORING_IMAGES } from '../../games/coloringImages';
import { loadColoringProgress } from '../../services/coloringProgressService';
import { resolveProfileId } from '../../services/profileUtils';
import themeVariables from '../../ui/stylesheets/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TILE_HEIGHT = 190;

const buildPathD = (points = []) => {
  if (!points.length) return '';
  const [first, ...rest] = points;
  let d = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
  rest.forEach((p) => {
    d += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  });
  return d;
};

const ColoringGalleryScreen = ({ profile, onBack, onSelectImage, highlightImageId }) => {
  const profileId = useMemo(() => resolveProfileId(profile), [profile]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [previewLayouts, setPreviewLayouts] = useState({});
  const [viewerLayouts, setViewerLayouts] = useState({});
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();

  useEffect(() => {
    let mounted = true;
    const fetchProgress = async () => {
      setLoading(true);
      const progress = await loadColoringProgress(profileId);
      if (mounted) {
        setProgressMap(progress);
        setLoading(false);
      }
    };
    fetchProgress();
    return () => {
      mounted = false;
    };
  }, [profileId]);

  const handleSelect = useCallback((imageId) => {
    if (typeof onSelectImage === 'function') {
      onSelectImage(imageId, progressMap[imageId]);
    }
  }, [onSelectImage, progressMap]);

  const computeDisplay = (canvasWidth, canvasHeight, containerWidth, containerHeight) => {
    if (!containerWidth || !containerHeight || !canvasWidth || !canvasHeight) {
      return { displayWidth: 0, displayHeight: 0, offsetX: 0, offsetY: 0 };
    }
    const scale = Math.min(
      containerWidth / canvasWidth,
      containerHeight / canvasHeight,
    );
    const displayWidth = canvasWidth * scale;
    const displayHeight = canvasHeight * scale;
    const offsetX = (containerWidth - displayWidth) / 2;
    const offsetY = (containerHeight - displayHeight) / 2;
    return { displayWidth, displayHeight, offsetX, offsetY };
  };

  const renderItem = useCallback(
    ({ item }) => {
      const drawing = progressMap[item.id];
      const hasDrawing = Array.isArray(drawing?.strokes) && drawing.strokes.length > 0;
      const derivedSize = (() => {
        if (drawing?.canvasSize?.width && drawing?.canvasSize?.height) {
          return drawing.canvasSize;
        }
        let maxX = 0;
        let maxY = 0;
        (drawing?.strokes || []).forEach((stroke) => {
          (stroke.points || []).forEach((p) => {
            if (typeof p.x === 'number') maxX = Math.max(maxX, p.x);
            if (typeof p.y === 'number') maxY = Math.max(maxY, p.y);
          });
        });
        if (maxX === 0 && maxY === 0) return { width: 400, height: 400 };
        return { width: Math.max(1, Math.ceil(maxX)), height: Math.max(1, Math.ceil(maxY)) };
      })();
      const canvasWidth = derivedSize.width || 400;
      const canvasHeight = derivedSize.height || 400;
      const tileHighlighted = highlightImageId === item.id;
      const layout = previewLayouts[item.id];
      const { displayWidth, displayHeight, offsetX, offsetY } = computeDisplay(
        canvasWidth,
        canvasHeight,
        layout?.width || 0,
        layout?.height || 0,
      );
      return (
        <TouchableOpacity
          style={[styles.tile, tileHighlighted && styles.tileHighlighted]}
          onPress={() => handleSelect(item.id)}
          activeOpacity={0.9}
        >
          <View
            style={styles.preview}
            accessible
            accessibilityLabel={`${item.label} preview`}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setPreviewLayouts((prev) => {
                const existing = prev[item.id];
                if (existing && Math.abs(existing.width - width) < 0.5 && Math.abs(existing.height - height) < 0.5) {
                  return prev;
                }
                return { ...prev, [item.id]: { width, height } };
              });
            }}
          >
            <Image source={item.source} resizeMode="contain" style={styles.previewImage} />
            {hasDrawing && layout ? (
              <Svg
                style={[
                  StyleSheet.absoluteFill,
                  { width: displayWidth, height: displayHeight, left: offsetX, top: offsetY },
                ]}
                pointerEvents="none"
                viewBox={`0 0 ${Math.max(1, canvasWidth)} ${Math.max(1, canvasHeight)}`}
                preserveAspectRatio="xMidYMid meet"
              >
                {drawing.strokes.map((stroke) => (
                  <Path
                    key={stroke.id}
                    d={buildPathD(stroke.points)}
                    stroke={stroke.color}
                    strokeWidth={stroke.width || 1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ))}
              </Svg>
            ) : null}
          </View>
          <Text style={styles.tileLabel}>{item.label}</Text>
        </TouchableOpacity>
      );
    },
    [handleSelect, progressMap, highlightImageId],
  );

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      colors={[themeVariables.gradientStart, themeVariables.gradientEnd]}
      style={styles.container}
    >
      <GameTopBar
        title="Virtue Gallery"
        onBack={onBack}
        rightAccessory={(
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              const idx = COLORING_IMAGES.findIndex(img => img.id === highlightImageId);
              setViewerIndex(idx >= 0 ? idx : 0);
              setIsFullscreen(prev => !prev);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={isFullscreen ? 'Close full screen view' : 'Open full screen view'}
          >
            <Ionicons name={isFullscreen ? 'contract' : 'expand'} size={22} color={themeVariables.whiteColor} />
          </TouchableOpacity>
        )}
      />
      {isFullscreen ? (
        <FlatList
          data={COLORING_IMAGES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          initialScrollIndex={Math.max(0, viewerIndex)}
          getItemLayout={(_data, index) => ({
            length: viewportWidth,
            offset: viewportWidth * index,
            index,
          })}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const drawing = progressMap[item.id];
            const hasDrawing = Array.isArray(drawing?.strokes) && drawing.strokes.length > 0;
            const derivedSize = (() => {
              if (drawing?.canvasSize?.width && drawing?.canvasSize?.height) {
                return drawing.canvasSize;
              }
              let maxX = 0;
              let maxY = 0;
              (drawing?.strokes || []).forEach((stroke) => {
                (stroke.points || []).forEach((p) => {
                  if (typeof p.x === 'number') maxX = Math.max(maxX, p.x);
                  if (typeof p.y === 'number') maxY = Math.max(maxY, p.y);
                });
              });
              if (maxX === 0 && maxY === 0) return { width: 400, height: 400 };
              return { width: Math.max(1, Math.ceil(maxX)), height: Math.max(1, Math.ceil(maxY)) };
            })();
            const canvasWidth = derivedSize.width || 400;
            const canvasHeight = derivedSize.height || 400;
            const layout = viewerLayouts[item.id];
            const { displayWidth, displayHeight, offsetX, offsetY } = computeDisplay(
              canvasWidth,
              canvasHeight,
              layout?.width || viewportWidth - 32,
              layout?.height || Math.min(520, Math.max(320, viewportHeight * 0.6)),
            );
            return (
              <Pressable
                style={[styles.viewerSlide, { width: viewportWidth }]}
                onPress={() => handleSelect(item.id)}
              >
                <View
                  style={[
                    styles.viewerImageWrapper,
                    { height: Math.min(520, Math.max(320, viewportHeight * 0.6)) },
                  ]}
                  onLayout={(event) => {
                    const { width, height } = event.nativeEvent.layout;
                    setViewerLayouts((prev) => {
                      const existing = prev[item.id];
                      if (existing && Math.abs(existing.width - width) < 0.5 && Math.abs(existing.height - height) < 0.5) {
                        return prev;
                      }
                      return { ...prev, [item.id]: { width, height } };
                    });
                  }}
                >
                  <Image source={item.source} resizeMode="contain" style={styles.viewerImage} />
                  {hasDrawing && layout ? (
                    <Svg
                      style={[
                        StyleSheet.absoluteFill,
                        { width: displayWidth, height: displayHeight, left: offsetX, top: offsetY },
                      ]}
                      pointerEvents="none"
                      viewBox={`0 0 ${Math.max(1, canvasWidth)} ${Math.max(1, canvasHeight)}`}
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {drawing.strokes.map((stroke) => (
                        <Path
                          key={stroke.id}
                          d={buildPathD(stroke.points)}
                          stroke={stroke.color}
                          strokeWidth={stroke.width || 1}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      ))}
                    </Svg>
                  ) : null}
                </View>
                <Text style={styles.viewerLabel}>{item.label}</Text>
              </Pressable>
            );
          }}
        />
      ) : (
        <>
          <FlatList
            data={COLORING_IMAGES}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={renderItem}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={styles.emptyText}>No images found.</Text>}
            style={styles.list}
          />
          {loading ? (
            <View style={styles.loaderOverlay} pointerEvents="none">
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : null}
        </>
      )}
    </LinearGradient>
  );
};

export default ColoringGalleryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 88,
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  tile: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 14,
    overflow: 'hidden',
    minHeight: TILE_HEIGHT,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    marginBottom: 12,
  },
  tileHighlighted: {
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOpacity: 0.45,
  },
  preview: {
    height: TILE_HEIGHT - 44,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    backgroundColor: '#0F172A',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  tileLabel: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: '#F9FAFB',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    width: '100%',
    marginTop: 24,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  viewerSlide: {
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  viewerImageWrapper: {
    width: '100%',
    height: 500,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  viewerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  viewerLabel: {
    marginTop: 12,
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '700',
  },
});
