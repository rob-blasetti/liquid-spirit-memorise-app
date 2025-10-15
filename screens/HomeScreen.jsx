import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import themeVariables from '../styles/theme';
import PrayerBlock from '../components/PrayerBlock';
import QuoteBlock from '../components/QuoteBlock';
import { grade1Lessons } from '../data/grade1';
import { quoteMap } from '../data/grade2';
import { quoteMap as quoteMap2b } from '../data/grade2b';
import HomeTopBar from '../components/HomeTopBar';

const TIMELINE_WIDTH = 56;
const CONTENT_MAX_WIDTH = 336;
const CONTENT_COLUMN_WIDTH = CONTENT_MAX_WIDTH - TIMELINE_WIDTH;
const BOTTOM_BUTTON_HEIGHT = 108;
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
  const hasGamesButton = typeof onOpenGames === 'function';
  const hasClassButton = typeof onOpenClass === 'function';
  const hasBottomButtons =
    hasLibraryButton || hasGamesButton || hasClassButton;

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

  const currentLessonNumber = Number(currentLesson);
  const currentSetNumber = Number(currentSet);

  const lessonTimeline = useMemo(() => {
    if (!Number.isFinite(currentLessonNumber)) {
      return [];
    }

    const resolveStatus = lessonNumber => {
      if (!Number.isFinite(currentLessonNumber)) {
        return 'upcoming';
      }
      if (lessonNumber < currentLessonNumber) {
        return 'completed';
      }
      if (lessonNumber === currentLessonNumber) {
        return 'active';
      }
      return 'upcoming';
    };

    if (profile.grade === 1) {
      const lessonIndex = grade1Lessons.findIndex(
        l => l.lesson === currentLessonNumber
      );
      const groupStart =
        lessonIndex >= 0 ? Math.max(0, Math.floor(lessonIndex / 3) * 3) : 0;
      const group = grade1Lessons.slice(groupStart, groupStart + 3);
      return group
        .map(lesson => ({
          id: `g1-${lesson.lesson}`,
          lessonNumber: lesson.lesson,
          title: `Lesson ${lesson.lesson}`,
          subtitle: lesson.virtue,
          status: resolveStatus(lesson.lesson),
        }))
        .reverse();
    }

    if ((profile.grade === 2 || profile.grade === '2b') && Number.isFinite(currentSetNumber)) {
      const sourceMap = profile.grade === 2 ? quoteMap : quoteMap2b;
      const lessonsInSet = Object.keys(sourceMap)
        .filter(key => key.startsWith(`${currentSetNumber}-`))
        .map(key => Number(key.split('-')[1]))
        .filter(num => Number.isFinite(num));
      const uniqueLessons = Array.from(new Set(lessonsInSet)).sort(
        (a, b) => b - a
      );
      return uniqueLessons.map(lessonNum => {
        const key = `${currentSetNumber}-${lessonNum}`;
        const data = sourceMap[key] || {};
        return {
          id: `g${profile.grade}-${key}`,
          lessonNumber: lessonNum,
          title: `Lesson ${lessonNum}`,
          subtitle: data.virtue || data.topic || null,
          status: resolveStatus(lessonNum),
        };
      });
    }

    return [];
  }, [profile.grade, currentLessonNumber, currentSetNumber]);

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
                {hasPrayer && hasQuote ? (
                  <View style={styles.lessonTabs}>
                    <TouchableOpacity
                      style={[
                        styles.lessonTab,
                        activeContent === 'quote' && styles.lessonTabActive,
                      ]}
                      onPress={() => setActiveContent('quote')}
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
                      onPress={() => setActiveContent('prayer')}
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
                ) : null}
                {(activeContent === 'quote' && hasQuote) || (activeContent === 'prayer' && hasPrayer) ? (
                  <View style={styles.lessonContentInner}>
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
                  </View>
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
          <View style={styles.timelineColumn}>
            {lessonTimeline.length > 0 ? (
              <View style={styles.lessonTimelineContainer}>
                {lessonTimeline.map((item, index) => {
                  const isFirst = index === 0;
                  const isLast = index === lessonTimeline.length - 1;
                  const prevStatus = index > 0 ? lessonTimeline[index - 1].status : null;
                  const topSegmentStyles = [
                    styles.lessonTimelineLineSegment,
                    isFirst && styles.lessonTimelineLineSegmentHidden,
                  ];
                  if (!isFirst && prevStatus === 'completed') {
                    topSegmentStyles.push(styles.lessonTimelineLineSegmentCompleted);
                  }
                  const bottomSegmentStyles = [
                    styles.lessonTimelineLineSegment,
                    isLast && styles.lessonTimelineLineSegmentHidden,
                  ];
                  if (!isLast && item.status === 'completed') {
                    bottomSegmentStyles.push(styles.lessonTimelineLineSegmentCompleted);
                  }
                  if (!isLast && item.status === 'active') {
                    bottomSegmentStyles.push(styles.lessonTimelineLineSegmentActive);
                  }
                  const circleStyles = [styles.lessonTimelineCircle];
                  if (item.status === 'completed') {
                    circleStyles.push(styles.lessonTimelineCircleCompleted);
                  } else if (item.status === 'active') {
                    circleStyles.push(styles.lessonTimelineCircleActive);
                  }
                  const itemStyles = [styles.lessonTimelineItem];
                  if (isLast) {
                    itemStyles.push(styles.lessonTimelineItemLast);
                  }
                  return (
                    <View key={item.id} style={itemStyles}>
                      <View style={styles.lessonTimelineIndicator}>
                        <View style={topSegmentStyles} />
                        <View style={circleStyles}>
                          <Text
                            style={[
                              styles.lessonTimelineCircleText,
                              item.status === 'completed' && styles.lessonTimelineCircleTextCompleted,
                              item.status === 'active' && styles.lessonTimelineCircleTextActive,
                            ]}
                          >
                            {item.lessonNumber}
                          </Text>
                        </View>
                        <View style={bottomSegmentStyles} />
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        </View>
        {hasBottomButtons ? (
          <View style={styles.bottomButtonContainer}>
            {hasLibraryButton ? (
              <TouchableOpacity style={styles.actionButton} onPress={onOpenLibrary}>
                <Ionicons
                  name="library-outline"
                  size={28}
                  color={themeVariables.whiteColor}
                  style={styles.actionButtonIcon}
                />
                <Text style={styles.actionButtonText}>Go To Library</Text>
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
              <TouchableOpacity style={styles.actionButton} onPress={onOpenClass}>
                <Ionicons
                  name="people-circle-outline"
                  size={28}
                  color={themeVariables.whiteColor}
                  style={styles.actionButtonIcon}
                />
                <Text style={styles.actionButtonText}>See My Class</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>

      <FastImage
        source={require('../assets/img/pearlina-pointing-right.png')}
        style={styles.pearlinaImage}
        resizeMode={FastImage.resizeMode.contain}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    paddingHorizontal: 0,
    marginBottom: BOTTOM_BUTTON_MARGIN_TOP,
    maxHeight: '100%',
    minHeight: 0,
  },
  lessonColumn: {
    width: CONTENT_COLUMN_WIDTH,
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingRight: 8,
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
  lessonContentInner: {
    width: '100%',
    alignItems: 'stretch',
    gap: 12,
  },
  lessonTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    alignSelf: 'stretch',
    borderRadius: themeVariables.borderRadiusPill + 4,
    paddingHorizontal: 4,
  },
  lessonTab: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    borderRadius: themeVariables.borderRadiusPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonTabActive: {
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: themeVariables.whiteColor,
  },
  lessonTabLabel: {
    color: themeVariables.whiteColor,
    fontSize: 15,
    fontWeight: '700',
    opacity: 0.85,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  lessonTabLabelActive: {
    color: themeVariables.whiteColor,
    opacity: 1,
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
  actionButtonIcon: {
    marginBottom: 8,
  },
  actionButtonText: {
    color: themeVariables.whiteColor,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  pearlinaImage: {
    position: 'absolute',
    bottom: 110,
    left: -40,
    width: 120,
    height: 120,
  },
  timelineColumn: {
    width: TIMELINE_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingLeft: 8,
  },
  lessonTimelineContainer: {
    width: TIMELINE_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  lessonTimelineItem: {
    marginBottom: 24,
    alignItems: 'center',
  },
  lessonTimelineItemLast: {
    marginBottom: 0,
  },
  lessonTimelineIndicator: {
    width: 32,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  lessonTimelineLineSegment: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  lessonTimelineLineSegmentHidden: {
    backgroundColor: 'transparent',
  },
  lessonTimelineLineSegmentCompleted: {
    backgroundColor: themeVariables.secondaryColor,
  },
  lessonTimelineLineSegmentActive: {
    backgroundColor: themeVariables.primaryColor,
  },
  lessonTimelineCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: themeVariables.primaryColor,
    backgroundColor: themeVariables.whiteColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonTimelineCircleCompleted: {
    borderColor: themeVariables.primaryColor,
    backgroundColor: themeVariables.whiteColor,
  },
  lessonTimelineCircleActive: {
    borderColor: themeVariables.primaryColor,
    backgroundColor: themeVariables.primaryColor,
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  lessonTimelineCircleText: {
    color: themeVariables.primaryColor,
    fontSize: 14,
    fontWeight: '600',
  },
  lessonTimelineCircleTextCompleted: {
    color: themeVariables.primaryColor,
  },
  lessonTimelineCircleTextActive: {
    color: themeVariables.whiteColor,
    fontSize: 16,
  },
});

export default HomeScreen;
