import React from 'react';
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

  console.log('profile: ', profile);

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
      />

      {/* Prayer and Quote Blocks */}
      <View style={styles.contentContainer}>
        {prayerToShow ? (
          <PrayerBlock
            prayer={prayerToShow}
            profile={profile}
          />
        ) : null}
        {quoteToShow ? (
          <QuoteBlock
            quote={quoteToShow}
            profile={profile}
            references={references}
          />
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
        <TouchableOpacity style={styles.customButton} onPress={onJourney}>
          <Text style={styles.customButtonText}>Lesson Journey</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
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
    backgroundColor: themeVariables.primaryColor,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
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
});

export default HomeScreen;
