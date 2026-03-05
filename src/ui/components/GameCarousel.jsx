import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { FlatList, View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import themeVariables from '../stylesheets/theme';
import GameTile from './GameTile';

const { width } = Dimensions.get('window');
const CAROUSEL_SPACING = 18;
const CARD_WIDTH = width * 0.64;
const CARD_HEIGHT = CARD_WIDTH * 1.08;
const SIDE_SPACING = (width - CARD_WIDTH) / 2;
const DEFAULT_AUTOSCROLL_INTERVAL = 6000;

const LOOP_CLONES = 2; // number of clones per side to simulate infinite loop

const createLoopedData = (data) => {
  if (!data || data.length === 0) return [];
  if (data.length <= LOOP_CLONES) {
    return [...data];
  }
  const head = data.slice(0, LOOP_CLONES);
  const tail = data.slice(-LOOP_CLONES);
  return [...tail, ...data, ...head];
};

const GameCarousel = ({ data, onSelect, interval = DEFAULT_AUTOSCROLL_INTERVAL }) => {
  const loopedData = useMemo(() => {
    if (__DEV__) {
      console.debug('[GameCarousel] createLoopedData', {
        length: data.length,
        clones: LOOP_CLONES,
      });
    }
    return createLoopedData(data);
  }, [data]);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const autoScrollTimerRef = useRef(null);
  const itemWidth = CARD_WIDTH + CAROUSEL_SPACING;
  const hasLooping = loopedData.length > data.length;
  const isInitializedRef = useRef(false);
  const prevDataLengthRef = useRef(0);
  const prevHasLoopingRef = useRef(hasLooping);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollAnim } } }],
    { useNativeDriver: false },
  );

  const getActualIndex = useCallback((index) => {
    const dataLength = data.length;
    if (dataLength === 0) return 0;
    let adjusted = (index - LOOP_CLONES) % dataLength;
    if (adjusted < 0) adjusted += dataLength;
    if (__DEV__) {
      console.debug('[GameCarousel] getActualIndex', { index, adjusted, dataLength });
    }
    return adjusted;
  }, [data.length]);

  const clearAutoScroll = useCallback(() => {
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  }, []);

  const scheduleAutoScroll = useCallback(() => {
    if (!interval || data.length <= 1) {
      clearAutoScroll();
      return;
    }
    clearAutoScroll();
    autoScrollTimerRef.current = setTimeout(() => {
      const nextIndex = data.length === 0 ? 0 : (activeIndex + 1) % data.length;
      const rawTarget = hasLooping ? nextIndex + LOOP_CLONES : nextIndex;
      const offset = rawTarget * itemWidth;
      if (__DEV__) {
        console.debug('[GameCarousel] autoScroll', {
          activeIndex,
          nextIndex,
          rawTarget,
          itemWidth,
        });
      }
      listRef.current?.scrollToOffset({ offset, animated: true });
    }, interval);
  }, [interval, data.length, clearAutoScroll, activeIndex, itemWidth, hasLooping]);

  const onMomentumEnd = (event) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const rawIndex = Math.round(xOffset / itemWidth);
    const actualIndex = getActualIndex(rawIndex);
    setActiveIndex(actualIndex);
    clearAutoScroll();
    scheduleAutoScroll();
    if (__DEV__) {
      console.debug('[GameCarousel] onMomentumEnd', {
        xOffset,
        rawIndex,
        actualIndex,
        hasLooping,
      });
    }

    // handle looping (defer to next frame to avoid momentum conflicts)
    if (hasLooping && (rawIndex < LOOP_CLONES || rawIndex >= LOOP_CLONES + data.length)) {
      requestAnimationFrame(() => {
        if (rawIndex < LOOP_CLONES) {
          const targetIndex = rawIndex + data.length;
          const offset = targetIndex * itemWidth;
          listRef.current?.scrollToOffset({ offset, animated: false });
        } else if (rawIndex >= LOOP_CLONES + data.length) {
          const targetIndex = rawIndex - data.length;
          const offset = targetIndex * itemWidth;
          listRef.current?.scrollToOffset({ offset, animated: false });
        }
      });
    }
  };

  const handleScrollEndDrag = useCallback(
    (event) => {
      const velocityX = event?.nativeEvent?.velocity?.x ?? 0;
      if (Math.abs(velocityX) < 0.1) {
        scheduleAutoScroll();
      }
    },
    [scheduleAutoScroll],
  );

  useEffect(() => {
    const loopLength = loopedData.length;
    const dataLength = data.length;
    if (__DEV__) {
      console.debug('[GameCarousel] setup', {
        loopLength,
        dataLength,
        hasLooping,
        initialized: isInitializedRef.current,
      });
    }

    if (loopLength === 0) {
      setActiveIndex(0);
      isInitializedRef.current = false;
      prevDataLengthRef.current = 0;
      prevHasLoopingRef.current = hasLooping;
      clearAutoScroll();
      return () => clearAutoScroll();
    }

    const needsReset =
      !isInitializedRef.current ||
      prevDataLengthRef.current !== dataLength ||
      prevHasLoopingRef.current !== hasLooping;

    if (needsReset) {
      setActiveIndex(0);
      requestAnimationFrame(() => {
        if (listRef.current) {
          const offset = hasLooping ? LOOP_CLONES * itemWidth : 0;
          if (__DEV__) {
            console.debug('[GameCarousel] scrollToOffset initial', { offset });
          }
          listRef.current.scrollToOffset({ offset, animated: false });
        }
      });
      isInitializedRef.current = true;
    }

    prevDataLengthRef.current = dataLength;
    prevHasLoopingRef.current = hasLooping;

    if (!interval || dataLength <= 1) {
      clearAutoScroll();
    }

    return () => clearAutoScroll();
  }, [loopedData.length, hasLooping, itemWidth, interval, data.length, clearAutoScroll]);

  useEffect(() => {
    scheduleAutoScroll();
    return () => clearAutoScroll();
  }, [scheduleAutoScroll, clearAutoScroll]);

  const renderItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <GameTile
        variant="carousel"
        title={item.title}
        icon={item.icon}
        cardImage={item.cardImage}
        gradient={item.gradient}
        onPress={() => onSelect?.(item.id)}
      />
    </View>
  );

  return (
    <View>
      <FlatList
        ref={listRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={loopedData}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
        snapToAlignment="center"
        snapToInterval={CARD_WIDTH + CAROUSEL_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No games available</Text>
            <Text style={styles.emptySubtitle}>Check back again soon.</Text>
          </View>
        }
        onScroll={handleScroll}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, index) => ({
          length: itemWidth,
          offset: itemWidth * index,
          index,
        })}
        initialScrollIndex={loopedData.length > 0 ? (hasLooping ? LOOP_CLONES : 0) : 0}
        initialNumToRender={Math.min(loopedData.length, 5)}
        onTouchStart={clearAutoScroll}
        onTouchEnd={scheduleAutoScroll}
        onScrollBeginDrag={clearAutoScroll}
        onMomentumScrollBegin={clearAutoScroll}
        onScrollEndDrag={handleScrollEndDrag}
      />
      {data.length > 1 && (
        <View style={styles.dotsWrapper}>
          {data.map((_, idx) => (
            <View
              key={`dot-${idx}`}
              style={[
                styles.dot,
                idx === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContent: {
    paddingVertical: 24,
    paddingHorizontal: SIDE_SPACING,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: CAROUSEL_SPACING / 2,
  },
  emptyState: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: themeVariables.whiteColor,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
  },
  dotsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: themeVariables.whiteColor,
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});

export default GameCarousel;
