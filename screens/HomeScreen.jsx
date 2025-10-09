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
import ProfileDisplay from '../components/ProfileDisplay';

const HomeScreen = ({
  profile,
  achievements,
  onDailyChallenge,
  currentSet,
  currentLesson,
  onProfilePress,
  onAvatarPress,
  onJourney,
  canSwitchAccount,
}) => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.debug('HomeScreen achievements:', achievements);
  }
  // Determine prayer and quote based on grade and progress
  let prayerToShow = null;
  let quoteToShow = null;
  let references = [];
  // Compose lesson display once for use below
  const lessonDisplay =
    (typeof currentSet !== 'undefined' && currentSet !== null)
      ? `${currentSet}.${currentLesson}`
      : (typeof currentLesson !== 'undefined' && currentLesson !== null
          ? `${currentLesson}`
          : null);
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

  console.log('profile: ', profile);

  const hasPrayer = Boolean(prayerToShow);
  const hasQuote = Boolean(quoteToShow);
  const [activeContent, setActiveContent] = useState(
    hasQuote ? 'quote' : hasPrayer ? 'prayer' : null
  );

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
      {/* Profile Header */}
      <ProfileDisplay
        profile={profile}
        achievements={achievements}
        currentSet={currentSet}
        currentLesson={currentLesson}
        onAvatarPress={onAvatarPress}
        onProfilePress={onProfilePress}
        canSwitchAccount={canSwitchAccount}
      />

      {/* Prayer and Quote Blocks */}
      <View style={styles.contentContainer}>
        <View style={styles.lessonContent}>
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
          {!hasPrayer && !hasQuote ? (
            <Text style={styles.emptyLessonText}>
              Content for this lesson will appear here.
            </Text>
          ) : null}
        </View>
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

      {/* Pearlina image positioned bottom-left pointing towards quote */}
      <FastImage
        source={require('../assets/img/pearlina-pointing-right.png')}
        style={styles.pearlinaImage}
        resizeMode={FastImage.resizeMode.contain}
      />

      {/* Action Buttons */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.customButton} onPress={onDailyChallenge}>
          <Text style={styles.customButtonText}>Daily Challenge</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    // Let the global ScreenBackground gradient show through
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingRight: 0,
    marginTop: 24,
    width: '100%',
  },
  lessonContent: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  lessonTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    padding: 4,
  },
  lessonTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonTabActive: {
    backgroundColor: themeVariables.primaryColor,
  },
  lessonTabLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  lessonTabLabelActive: {
    color: themeVariables.whiteColor,
  },
  emptyLessonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 32,
  },
  bottomButtonContainer: {
    width: '100%',
    marginTop: 24,
    gap: 12,
    marginBottom: 40,
  },
  customButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: themeVariables.whiteColor,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
  },
  customButtonText: {
    color: themeVariables.whiteColor,
    fontSize: 16,
    fontWeight: '500',
  },
  pearlinaImage: {
    position: 'absolute',
    bottom: 110,
    left: -40,
    width: 120,
    height: 120,
  },
  lessonTimelineContainer: {
    width: 56,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  lessonTimelineItem: {
    marginBottom: 24,
    alignItems: 'flex-end',
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
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonTimelineCircleCompleted: {
    borderColor: themeVariables.secondaryColor,
    backgroundColor: themeVariables.secondaryColor,
  },
  lessonTimelineCircleActive: {
    borderColor: themeVariables.primaryColor,
    backgroundColor: themeVariables.primaryColor,
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  lessonTimelineCircleText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 14,
    fontWeight: '600',
  },
  lessonTimelineCircleTextCompleted: {
    color: themeVariables.whiteColor,
  },
  lessonTimelineCircleTextActive: {
    color: themeVariables.whiteColor,
    fontSize: 16,
  },
});

export default HomeScreen;
