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
import LinearGradient from 'react-native-linear-gradient';
import themeVariables from '../styles/theme';
import PrayerBlock from '../components/PrayerBlock';
import QuoteBlock from '../components/QuoteBlock';
import { grade1Lessons } from '../data/grade1';
import { quoteMap } from '../data/grade2';
import { quoteMap as quoteMap2b } from '../data/grade2b';
import HomeTopBar from '../components/HomeTopBar';
import speechService from '../services/speechService';

const CONTENT_MAX_WIDTH = 336;
const BOTTOM_BUTTON_MARGIN_TOP = 24;
const AUDIO_CONTROL_SIZE = 44;

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
  const [lessonContentHeight, setLessonContentHeight] = useState(null);
  const [lessonHeaderHeight, setLessonHeaderHeight] = useState(0);
  const lessonIdentifier = Number.isFinite(currentLessonNumber)
    ? Number.isFinite(currentSetNumber)
      ? `${currentSetNumber}.${currentLessonNumber}`
      : `${currentLessonNumber}`
    : null;
  const indicatorTranslate = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslate = useRef(new Animated.Value(0)).current;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const cancelRef = useRef(false);
  const currentDisplayText =
    activeContent === 'quote'
      ? quoteToShow
      : activeContent === 'prayer'
        ? prayerToShow
        : '';
  const hasPlayableContent =
    typeof currentDisplayText === 'string' && currentDisplayText.trim().length > 0;

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

  useEffect(() => {
    const onFinish = () => setIsSpeaking(false);
    speechService.setupTTSListeners(onFinish);
    return () => {
      cancelRef.current = true;
      speechService.hardStop();
      speechService.cleanupTTSListeners();
    };
  }, []);

  const playbackKey = `${activeContent || 'none'}|${currentDisplayText || ''}`;
  useEffect(() => {
    if (!isSpeaking) return;
    cancelRef.current = true;
    speechService.hardStop();
    setIsSpeaking(false);
  }, [playbackKey]);

  const handleAudioPress = async () => {
    if (!hasPlayableContent) return;
    try {
      if (isSpeaking) {
        cancelRef.current = true;
        await speechService.hardStop();
        setIsSpeaking(false);
        return;
      }
      cancelRef.current = false;
      setIsSpeaking(true);
      speechService.readQuote(currentDisplayText, profile, cancelRef);
    } catch (error) {
      console.warn('TTS failed:', error);
      setIsSpeaking(false);
    }
  };

  const renderAudioControl = () => {
    if (!hasPlayableContent) {
      return null;
    }
    const gradientColors = isSpeaking
      ? ['rgba(109,87,255,0.65)', 'rgba(109,87,255,0.35)', 'rgba(255,255,255,0.25)']
      : ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.22)', 'rgba(255,255,255,0.12)'];
    const sheenColors = ['rgba(255,255,255,0.85)', 'rgba(255,255,255,0.0)'];
    return (
      <TouchableOpacity
        style={[
          styles.audioControlButton,
          isSpeaking && styles.audioControlButtonActive,
        ]}
        onPress={handleAudioPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.92}
        accessibilityLabel={isSpeaking ? 'Stop audio playback' : 'Play current passage'}
        accessibilityHint={
          isSpeaking
            ? 'Stops the audio narration.'
            : 'Plays the currently selected quote or prayer.'
        }
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.audioControlGradient}
          pointerEvents="none"
        />
        <LinearGradient
          colors={sheenColors}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.audioControlSheen}
          pointerEvents="none"
        />
        <Ionicons
          name={isSpeaking ? 'stop-circle-outline' : 'play-circle-outline'}
          size={26}
          color={isSpeaking ? themeVariables.whiteColor : themeVariables.blackColor}
          style={styles.audioControlIcon}
        />
      </TouchableOpacity>
    );
  };

  const audioControl = renderAudioControl();
  const computedContentHeight =
    lessonContentHeight != null
      ? Math.max(180, lessonContentHeight - lessonHeaderHeight - 24)
      : undefined;

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
            <View
              style={styles.lessonContent}
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setLessonContentHeight((prev) =>
                  Math.abs((prev ?? 0) - height) < 0.5 ? prev : height
                );
              }}
            >
              <View style={styles.lessonInner}>
                <View
                  style={styles.lessonHeader}
                  onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    setLessonHeaderHeight((prev) =>
                      Math.abs(prev - height) < 0.5 ? prev : height
                    );
                  }}
                >
                  <Text style={styles.lessonSectionTitle}>
                    {`Current Lesson${lessonIdentifier ? ` ${lessonIdentifier}` : ''}`}
                  </Text>
                  {hasPrayer && hasQuote ? (
                    <View style={styles.lessonTabsRow}>
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
                      {audioControl}
                    </View>
                  ) : (
                    audioControl ? (
                      <View style={styles.audioControlSolo}>{audioControl}</View>
                    ) : null
                  )}
                </View>
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
                        maxHeight={computedContentHeight}
                      />
                    ) : null}
                    {activeContent === 'prayer' && hasPrayer ? (
                      <PrayerBlock
                        prayer={prayerToShow}
                        profile={profile}
                        maxHeight={computedContentHeight}
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
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  lessonContentInner: {
    width: '100%',
    alignItems: 'stretch',
    gap: 12,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
  lessonHeader: {
    width: '100%',
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  lessonTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    alignSelf: 'stretch',
    marginTop: 12,
  },
  lessonTabsWrapper: {
    position: 'relative',
    flex: 1,
    alignSelf: 'stretch',
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
  audioControlSolo: {
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  audioControlButton: {
    width: AUDIO_CONTROL_SIZE,
    height: AUDIO_CONTROL_SIZE,
    borderRadius: AUDIO_CONTROL_SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(109,87,255,0.55)',
    shadowOpacity: 0.32,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    overflow: 'hidden',
  },
  audioControlButtonActive: {
    borderColor: 'rgba(109,87,255,0.65)',
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
  audioControlGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  audioControlSheen: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    height: AUDIO_CONTROL_SIZE / 2,
    borderTopLeftRadius: AUDIO_CONTROL_SIZE / 2,
    borderTopRightRadius: AUDIO_CONTROL_SIZE / 2,
    opacity: 0.9,
  },
  audioControlIcon: {
    zIndex: 1,
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
