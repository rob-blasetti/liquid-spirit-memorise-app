import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';
import themeVariables from '../styles/theme';
import PrayerBlock from '../components/PrayerBlock';
import QuoteBlock from '../components/QuoteBlock';
import { grade1Lessons } from '../data/grade1';
import { quoteMap } from '../data/grade2';
import { quoteMap as quoteMap2b } from '../data/grade2b';
import HomeTopBar from '../components/HomeTopBar';

const CONTENT_MAX_WIDTH = 336;
const BOTTOM_BUTTON_MARGIN_TOP = 24;

const HomeScreen = ({
  profile,
  achievements,
  currentSet,
  currentLesson,
  onAvatarPress,
  onJourney,
  onOpenSettings,
  onOpenAchievements,
  onOpenClass,
  onOpenLibrary,
  onOpenGames,
}) => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.debug('HomeScreen achievements:', achievements);
  }
  const isLinkedAccount = Boolean(profile?.linkedAccount || profile?.type === 'linked');
  // Determine prayer and quote based on grade and progress
  let prayerToShow = null;
  let quoteToShow = null;
  let references = [];
  if (profile.grade === 1) {
    const lesson = grade1Lessons.find(l => l.lesson === currentLesson);
    prayerToShow = lesson?.prayer;
    quoteToShow = lesson?.quote;
  } else if (profile.grade === 2) {
    const key = `${currentSet}-${currentLesson}`;
    const qObj = quoteMap[key] || {};
    quoteToShow = qObj.text;
    references = qObj.references || [];
  } else if (profile.grade === '2b') {
    // For grade 2b, show prayer and quote based on the current set and lesson
    const setKey = String(currentSet);
    // Prayer is stored on the first lesson of each set
    prayerToShow = quoteMap2b[`${setKey}-1`]?.prayer;
    const key = `${setKey}-${currentLesson}`;
    const qObj = quoteMap2b[key] || {};
    quoteToShow = qObj.text;
    references = qObj.references || [];
  }
  const hasPrayer = Boolean(prayerToShow);
  const hasQuote = Boolean(quoteToShow);
  const [activeContent, setActiveContent] = useState(
    hasQuote ? 'quote' : hasPrayer ? 'prayer' : null
  );
  const hasLibraryButton = typeof onOpenLibrary === 'function';
  const libraryButtonDisabled = true;
  const hasGamesButton = typeof onOpenGames === 'function';
  const hasClassButton = typeof onOpenClass === 'function';
  const classButtonDisabled = !isLinkedAccount;
  const hasBottomButtons =
    hasLibraryButton || hasGamesButton || hasClassButton;

  const currentLessonNumber = Number(currentLesson);
  const currentSetNumber = Number(currentSet);

  const [tabLayouts, setTabLayouts] = useState({
    quote: null,
    prayer: null,
  });
  const lessonIdentifier = Number.isFinite(currentLessonNumber)
    ? Number.isFinite(currentSetNumber)
      ? `${currentSetNumber}.${currentLessonNumber}`
      : `${currentLessonNumber}`
    : null;
  const indicatorTranslate = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasPrayer && hasQuote) {
      setActiveContent(prev => {
        if (prev === 'prayer' || prev === 'quote') {
          return prev;
        }
        return 'quote';
      });
    } else if (hasPrayer) {
      setActiveContent('prayer');
    } else if (hasQuote) {
      setActiveContent('quote');
    } else {
      setActiveContent(null);
    }
  }, [
    hasPrayer,
    hasQuote,
    prayerToShow,
    quoteToShow,
    currentLessonNumber,
    currentSetNumber,
  ]);

  const isAnimatingRef = useRef(false);
  const activeTabLayout = activeContent ? tabLayouts[activeContent] : null;

  const handleTabLayout = type => event => {
    const layout = event.nativeEvent.layout;
    setTabLayouts(prev => {
      const prevLayout = prev[type];
      if (
        prevLayout &&
        Math.abs(prevLayout.x - layout.x) < 0.5 &&
        Math.abs(prevLayout.width - layout.width) < 0.5
      ) {
        return prev;
      }
      return { ...prev, [type]: layout };
    });
    if (type === activeContent) {
      indicatorTranslate.setValue(layout.x);
      indicatorWidth.setValue(layout.width);
    }
  };

  const handleTabPress = type => {
    if (!type || type === activeContent || isAnimatingRef.current) {
      return;
    }

    const targetLayout = tabLayouts[type];
    const currentIndex = activeContent === 'prayer' ? 1 : 0;
    const nextIndex = type === 'prayer' ? 1 : 0;
    const direction = nextIndex > currentIndex ? 1 : -1;

    contentOpacity.stopAnimation();
    contentTranslate.stopAnimation();
    indicatorTranslate.stopAnimation();
    indicatorWidth.stopAnimation();

    if (targetLayout) {
      Animated.parallel([
        Animated.spring(indicatorTranslate, {
          toValue: targetLayout.x,
          damping: 18,
          stiffness: 250,
          mass: 0.9,
          useNativeDriver: false,
        }),
        Animated.spring(indicatorWidth, {
          toValue: targetLayout.width,
          damping: 20,
          stiffness: 240,
          mass: 1,
          useNativeDriver: false,
        }),
      ]).start();
    }

    isAnimatingRef.current = true;

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslate, {
        toValue: direction * -14,
        duration: 220,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveContent(type);
      const entryStart = direction * 14;
      contentOpacity.setValue(0);
      contentTranslate.setValue(entryStart);
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(contentTranslate, {
          toValue: 0,
          speed: 16,
          bounciness: 10,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isAnimatingRef.current = false;
      });
    });
  };

  useEffect(() => {
    const layout = activeContent ? tabLayouts[activeContent] : null;
    if (layout && !isAnimatingRef.current) {
      indicatorTranslate.setValue(layout.x);
      indicatorWidth.setValue(layout.width);
    }
  }, [
    activeContent,
    tabLayouts.quote,
    tabLayouts.prayer,
    indicatorTranslate,
    indicatorWidth,
  ]);

  return (
    <View style={styles.container}>
      <HomeTopBar
        profile={profile}
        onAvatarPress={onAvatarPress}
        onOpenAchievements={onOpenAchievements}
        onOpenSettings={onOpenSettings}
        onOpenClass={onOpenClass}
      />

      <View style={styles.mainContent}>
        <View style={styles.contentContainer}>
          <View style={styles.lessonColumn}>
            <View style={styles.lessonContent}>
              <View style={styles.lessonInner}>
                <Text style={styles.lessonSectionTitle}>
                  {`Current Lesson${lessonIdentifier ? ` ${lessonIdentifier}` : ''}`}
                </Text>
                {hasPrayer && hasQuote ? (
                  <View style={styles.lessonTabsWrapper}>
                    <BlurView
                      style={styles.lessonTabsBlur}
                      blurType="light"
                      blurAmount={20}
                      reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.3)"
                    />
                    <View style={styles.lessonTabs}>
                      {activeTabLayout ? (
                        <Animated.View
                          pointerEvents="none"
                          style={[
                            styles.lessonTabIndicator,
                            {
                              width: indicatorWidth,
                              transform: [{ translateX: indicatorTranslate }],
                            },
                          ]}
                        />
                      ) : null}
                      <TouchableOpacity
                        style={[
                          styles.lessonTab,
                          activeContent === 'quote' && styles.lessonTabActive,
                        ]}
                        onPress={() => handleTabPress('quote')}
                        onLayout={handleTabLayout('quote')}
                        activeOpacity={0.9}
                      >
                        <Text
                          style={[
                            styles.lessonTabLabel,
                            activeContent === 'quote' && styles.lessonTabLabelActive,
                          ]}
                        >
                          Quote
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.lessonTab,
                          activeContent === 'prayer' && styles.lessonTabActive,
                        ]}
                        onPress={() => handleTabPress('prayer')}
                        onLayout={handleTabLayout('prayer')}
                        activeOpacity={0.9}
                      >
                        <Text
                          style={[
                            styles.lessonTabLabel,
                            activeContent === 'prayer' && styles.lessonTabLabelActive,
                          ]}
                        >
                          Prayer
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
                {(activeContent === 'quote' && hasQuote) || (activeContent === 'prayer' && hasPrayer) ? (
                  <Animated.View
                    style={[
                      styles.lessonContentInner,
                      {
                        opacity: contentOpacity,
                        transform: [{ translateX: contentTranslate }],
                      },
                    ]}
                  >
                    {activeContent === 'quote' && hasQuote ? (
                      <QuoteBlock
                        quote={quoteToShow}
                        profile={profile}
                        references={references}
                      />
                    ) : null}
                    {activeContent === 'prayer' && hasPrayer ? (
                      <PrayerBlock
                        prayer={prayerToShow}
                        profile={profile}
                      />
                    ) : null}
                  </Animated.View>
                ) : null}
                {!hasPrayer && !hasQuote ? (
                  <View style={styles.lessonContentInner}>
                    <Text style={styles.emptyLessonText}>
                      Content for this lesson will appear here.
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </View>
        {hasBottomButtons ? (
          <View style={styles.bottomButtonContainer}>
            {hasLibraryButton ? (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  libraryButtonDisabled && styles.actionButtonDisabled,
                ]}
                onPress={onOpenLibrary}
                disabled={libraryButtonDisabled}
                activeOpacity={libraryButtonDisabled ? 1 : 0.75}
                accessibilityState={libraryButtonDisabled ? { disabled: true } : undefined}
              >
                <Ionicons
                  name="library-outline"
                  size={28}
                  color={
                    libraryButtonDisabled
                      ? 'rgba(255,255,255,0.6)'
                      : themeVariables.whiteColor
                  }
                  style={styles.actionButtonIcon}
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    libraryButtonDisabled && styles.actionButtonTextDisabled,
                  ]}
                >
                  Go To Library
                </Text>
              </TouchableOpacity>
            ) : null}
            {hasGamesButton ? (
              <TouchableOpacity style={styles.actionButton} onPress={onOpenGames}>
                <Ionicons
                  name="game-controller-outline"
                  size={28}
                  color={themeVariables.whiteColor}
                  style={styles.actionButtonIcon}
                />
                <Text style={styles.actionButtonText}>Games</Text>
              </TouchableOpacity>
            ) : null}
            {hasClassButton ? (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  classButtonDisabled && styles.actionButtonDisabled,
                ]}
                onPress={onOpenClass}
                disabled={classButtonDisabled}
                activeOpacity={classButtonDisabled ? 1 : 0.75}
                accessibilityState={classButtonDisabled ? { disabled: true } : undefined}
              >
                <Ionicons
                  name="people-circle-outline"
                  size={28}
                  color={
                    classButtonDisabled
                      ? 'rgba(255,255,255,0.6)'
                      : themeVariables.whiteColor
                  }
                  style={styles.actionButtonIcon}
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    classButtonDisabled && styles.actionButtonTextDisabled,
                  ]}
                >
                  See My Class
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>
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
  mainContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  contentContainer: {
    width: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    flexGrow: 1,
    flexShrink: 1,
    alignItems: 'stretch',
    paddingHorizontal: 0,
    marginBottom: BOTTOM_BUTTON_MARGIN_TOP,
    maxHeight: '100%',
    minHeight: 0,
  },
  lessonColumn: {
    width: '100%',
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  lessonContent: {
    flexGrow: 1,
    flexShrink: 1,
    alignItems: 'stretch',
    minHeight: 0,
  },
  lessonInner: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    paddingHorizontal: 0,
    paddingBottom: 16,
  },
  lessonSectionTitle: {
    color: themeVariables.whiteColor,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  lessonContentInner: {
    width: '100%',
    alignItems: 'stretch',
    gap: 12,
  },
  lessonTabsWrapper: {
    position: 'relative',
    alignSelf: 'stretch',
    marginBottom: 16,
    borderRadius: themeVariables.borderRadiusPill + 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  lessonTabsBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: themeVariables.borderRadiusPill + 6,
  },
  lessonTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  lessonTabIndicator: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    left: 0,
    borderRadius: themeVariables.borderRadiusPill,
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.46)',
    shadowColor: 'rgba(15, 32, 67, 0.3)',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  lessonTab: {
    flex: 1,
    minHeight: 46,
    marginHorizontal: 3,
    paddingVertical: 10,
    paddingHorizontal: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: themeVariables.borderRadiusPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonTabActive: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0)',
  },
  lessonTabLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  lessonTabLabelActive: {
    color: themeVariables.primaryColor,
    textShadowRadius: 0,
  },
  emptyLessonText: {
    color: themeVariables.primaryColor,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 8,
  },
  bottomButtonContainer: {
    width: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: themeVariables.whiteColor,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 6,
    minHeight: 100,
  },
  actionButtonDisabled: {
    opacity: 0.45,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  actionButtonIcon: {
    marginBottom: 8,
  },
  actionButtonText: {
    color: themeVariables.whiteColor,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
});

export default HomeScreen;
