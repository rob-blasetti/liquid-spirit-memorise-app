import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import Avatar from '@liquidspirit/react-native-boring-avatars';
import themeVariables from '../styles/theme';
import PrayerBlock from '../components/PrayerBlock';
import QuoteBlock from '../components/QuoteBlock';
import { grade1Lessons } from '../data/grade1';
import { quoteMap } from '../data/grade2';
import { quoteMap as quoteMap2b } from '../data/grade2b';
import ProfileDisplay from '../components/ProfileDisplay';
import Chip from '../components/Chip';

const bookImage = require('../assets/img/Book.png');
const AVATAR_SIZE = 68;

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

  const { firstName, lastName, username, totalPoints } = profile;
  const fullName = [firstName, lastName]
    .filter(part => typeof part === 'string' && part.trim().length > 0)
    .join(' ');
  const displayName = fullName || username;
  const rawGradeValue = profile.grade;
  const gradeString = rawGradeValue === null || typeof rawGradeValue === 'undefined'
    ? ''
    : String(rawGradeValue).trim();
  const normalizedGradeLabel = gradeString.length > 0
    && !['n/a', 'na', 'null', 'undefined', 'nan'].includes(gradeString.toLowerCase())
    ? gradeString.replace(
      /[a-z]+/gi,
      segment => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase(),
    )
    : null;
  const gradeChipText = (() => {
    if (!normalizedGradeLabel) return null;
    const lower = normalizedGradeLabel.toLowerCase();
    if (lower.startsWith('grade ')) return normalizedGradeLabel;
    if (/^\d/.test(normalizedGradeLabel)) return `Grade ${normalizedGradeLabel}`;
    if (lower === '2b') return 'Grade 2B';
    return normalizedGradeLabel;
  })();
  const showGradeChip = Boolean(gradeChipText);
  const canOpenClass = typeof onOpenClass === 'function';
  const showPointsButton = typeof onOpenAchievements === 'function';
  const isLinkedAccount = Boolean(
    profile?.linkedAccount || profile?.type === 'linked'
  );
  const avatarUri = profile.profilePicture || profile.avatar;
  const canPressAvatar = typeof onAvatarPress === 'function';
  const canPressProfile = typeof onProfilePress === 'function';

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity
            style={styles.topBarAvatarWrapper}
            onPress={canPressAvatar ? onAvatarPress : undefined}
            accessibilityRole={canPressAvatar ? 'button' : undefined}
            accessibilityLabel={canPressAvatar ? 'Update profile picture' : undefined}
            disabled={!canPressAvatar}
            activeOpacity={0.75}
          >
            {avatarUri ? (
              <FastImage
                source={{
                  uri: avatarUri,
                  priority: FastImage.priority.high,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={styles.topBarAvatar}
                resizeMode={FastImage.resizeMode.cover}
              />
            ) : (
              <Avatar size={AVATAR_SIZE} name={displayName} variant="beam" />
            )}
            {canPressAvatar ? (
              <View style={styles.topBarAvatarOverlay}>
                <Ionicons name="camera" size={14} color={themeVariables.blackColor} />
              </View>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topBarProfileInfo}
            onPress={canPressProfile ? onProfilePress : undefined}
            accessibilityRole={canPressProfile ? 'button' : undefined}
            accessibilityLabel={canPressProfile ? 'View profile' : undefined}
            disabled={!canPressProfile}
            activeOpacity={0.75}
          >
            <Text style={styles.topBarName} numberOfLines={1}>
              {displayName}
            </Text>
            {showGradeChip ? (
              <View style={styles.topBarGradeRow}>
                {isLinkedAccount ? (
                  <View style={styles.topBarLinkButton}>
                    <Ionicons
                      name="link"
                      size={14}
                      color={themeVariables.blackColor}
                    />
                  </View>
                ) : null}
                <Chip
                  text={gradeChipText}
                  icon="school-outline"
                  color={themeVariables.primaryColor}
                  bg="rgba(255, 255, 255, 0.85)"
                  style={[
                    styles.topBarGradeChip,
                    isLinkedAccount && styles.topBarGradeChipLinked,
                  ]}
                  onPress={canOpenClass ? onOpenClass : undefined}
                  accessibilityLabel={
                    canOpenClass
                      ? `View classes for ${gradeChipText}`
                      : gradeChipText
                  }
                />
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
        <View style={styles.topBarRight}>
          {showPointsButton ? (
            <TouchableOpacity
              style={styles.topBarPoints}
              onPress={onOpenAchievements}
              accessibilityRole="button"
              accessibilityLabel="View achievements"
              activeOpacity={0.75}
            >
              <View style={styles.topBarStarButton}>
                <Ionicons name="star-outline" size={14} color={themeVariables.blackColor} />
              </View>
              <Text style={styles.topBarPointsText}>{totalPoints ?? 0}</Text>
            </TouchableOpacity>
          ) : null}
          {typeof onOpenSettings === 'function' ? (
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={onOpenSettings}
              accessibilityRole="button"
              accessibilityLabel="Open settings"
            >
              <Ionicons name="settings-outline" size={20} color={themeVariables.whiteColor} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      {/* Profile Header */}
      <ProfileDisplay
        profile={profile}
        achievements={achievements}
        currentSet={currentSet}
        currentLesson={currentLesson}
        onAvatarPress={onAvatarPress}
        onProfilePress={onProfilePress}
        canSwitchAccount={canSwitchAccount}
        onPointsPress={onOpenAchievements}
        showGradeChip={false}
        showPoints={false}
      />

      {/* Prayer and Quote Blocks */}
      <View style={styles.contentContainer}>
        <FastImage
          source={bookImage}
          style={styles.lessonBackground}
          resizeMode={FastImage.resizeMode.cover}
        />
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
        {typeof onOpenClass === 'function' ? (
          <TouchableOpacity style={[styles.customButton, styles.secondaryButton]} onPress={onOpenClass}>
            <Text style={styles.customButtonText}>My Class</Text>
            <Ionicons name="people" size={20} color="white" />
          </TouchableOpacity>
        ) : null}
        {typeof onOpenLibrary === 'function' ? (
          <TouchableOpacity style={[styles.customButton, styles.secondaryButton]} onPress={onOpenLibrary}>
            <Text style={styles.customButtonText}>Go To Library</Text>
            <Ionicons name="library" size={20} color="white" />
          </TouchableOpacity>
        ) : null}
        {typeof onOpenGames === 'function' ? (
          <TouchableOpacity style={[styles.customButton, styles.secondaryButton]} onPress={onOpenGames}>
            <Text style={styles.customButtonText}>Games</Text>
            <Ionicons name="game-controller" size={20} color="white" />
          </TouchableOpacity>
        ) : null}
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
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  topBarAvatarWrapper: {
    position: 'relative',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  topBarAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  topBarAvatarOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: themeVariables.whiteColor,
    borderRadius: 14,
    padding: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
  },
  topBarProfileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  topBarName: {
    flexShrink: 1,
    color: themeVariables.whiteColor,
    fontSize: 20,
    fontWeight: '600',
  },
  topBarGradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  topBarGradeChip: {
    marginLeft: 0,
    marginRight: 0,
  },
  topBarGradeChipLinked: {
    marginLeft: 4,
  },
  topBarLinkButton: {
    backgroundColor: themeVariables.whiteColor,
    borderRadius: 14,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  topBarStarButton: {
    backgroundColor: themeVariables.whiteColor,
    borderRadius: 14,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  topBarPointsText: {
    color: themeVariables.whiteColor,
    fontSize: 14,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 8,
    borderRadius: 18,
    marginLeft: 8,
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
    position: 'relative',
  },
  lessonContent: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    paddingBottom: 0,
  },
  lessonBackground: {
    position: 'absolute',
    left: -250,
    right: -49,
    top: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  lessonInner: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  lessonContentInner: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  lessonTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 4,
  },
  lessonTab: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonTabActive: {
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: themeVariables.blackColor,
  },
  lessonTabLabel: {
    color: themeVariables.blackColor,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
  },
  lessonTabLabelActive: {
    color: themeVariables.blackColor,
    opacity: 1,
  },
  emptyLessonText: {
    color: themeVariables.primaryColor,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 8,
  },
  bottomButtonContainer: {
    width: '100%',
    marginTop: 24,
    gap: 12,
    marginBottom: 16,
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
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
