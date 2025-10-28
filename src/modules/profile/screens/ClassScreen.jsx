import React, { useMemo, useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { TabView, TabBar } from 'react-native-tab-view';
import Avatar from '@liquidspirit/react-native-boring-avatars';
import themeVariables from '../../../ui/stylesheets/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { preloadImages } from '../../../services/imageCache';
import Chip from '../../../ui/components/Chip';
import ScreenBackground from '../../../ui/components/ScreenBackground';
import TopNav from '../../../ui/components/TopNav';

const SectionScrollableGrid = ({ title, items = [], emptyText, maxHeight = 180 }) => {
  const [contentHeight, setContentHeight] = useState(0);
  const showHint = contentHeight > maxHeight;

  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContainer}>
        <ScrollView
          style={[styles.sectionScrollable, { maxHeight }]}
          contentContainerStyle={styles.gridList}
          nestedScrollEnabled
          showsVerticalScrollIndicator={showHint}
          onContentSizeChange={(_, h) => setContentHeight(h)}
        >
          {items?.length ? (
            items.map((person, idx) => (
              <View key={person.id || person._id || idx} style={styles.studentPill}>
                {person.profilePicture ? (
                  <FastImage
                    source={{
                      uri: person.profilePicture,
                      priority: FastImage.priority.normal,
                      cache: FastImage.cacheControl.immutable,
                    }}
                    style={styles.studentAvatar}
                  />
                ) : (
                  <Avatar size={36} name={`${person.firstName} ${person.lastName}`} variant="beam" />
                )}
                <Text style={styles.studentName} numberOfLines={1}>
                  {`${person.firstName} ${person.lastName}`}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>{emptyText}</Text>
          )}
        </ScrollView>
        {showHint && (
          <LinearGradient
            pointerEvents="none"
            colors={[
              'rgba(0,0,0,0)',
              'rgba(0,0,0,0.12)',
              'rgba(0,0,0,0.22)'
            ]}
            style={styles.sectionFade}
          >
            <View style={styles.fadeHintRow}>
              <Ionicons name="chevron-down" size={16} color={themeVariables.whiteColor} />
              <Text style={styles.fadeHintText}>Scroll</Text>
            </View>
          </LinearGradient>
        )}
      </View>
    </View>
  );
};

const ClassScreen = ({ childEntries = [], onBack }) => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  // Warm the cache for the active tab's images
  usePreloadForActiveTab(childEntries, index);

  const routes = childEntries.map((entry, idx) => {
    const key = entry._id || entry.id || entry.nuriUserId || idx;
    return {
      key: String(key),
      title: entry.firstName || '',
    };
  });

  const renderScene = ({ route }) => {
    const entry = childEntries.find(
      e => String(e._id || e.id || e.nuriUserId) === route.key
    );
    const classes = entry?.classes || entry?.class || [];

    const studentCount = classes.reduce((acc, c) => acc + (c.participants?.length || 0), 0);
    const teacherCount = classes.reduce((acc, c) => acc + (c.facilitators?.length || 0), 0);

    // Try to fill available vertical space without overlapping bottom nav
    const HEADER_BLOCK = 80; // approx header area including chevron
    const TABBAR_HEIGHT = 48; // default TabBar height
    const BOTTOM_NAV_GUARD = 24; // minor padding so content breathes
    const VERTICAL_PADDING = 24; // padding & margins
    const availableHeight = layout.height - HEADER_BLOCK - TABBAR_HEIGHT - BOTTOM_NAV_GUARD - VERTICAL_PADDING;
    const minCardHeight = Math.max(320, availableHeight);

    return (
      <View style={styles.scene}>
        {(classes && classes.length ? classes.slice(0, 1) : []).map((cls, classIndex) => {
          const grade = cls?.curriculumLesson?.grade;
          const lesson = cls?.curriculumLesson?.lessonNumber;
          return (
            <View
              key={cls.id || cls._id || classIndex}
              style={[styles.card, { minHeight: minCardHeight }]}
            >
              <View style={styles.cardHeader}>
                {cls.imageUrl ? (
                  <FastImage
                    source={{
                      uri: cls.imageUrl,
                      priority: FastImage.priority.high,
                      cache: FastImage.cacheControl.immutable,
                    }}
                    style={styles.headerImage}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                ) : null}
                <View style={styles.headerOverlay} />
                <View style={styles.headerContent}>
                  <Text style={styles.classTitle}>{cls.title}</Text>
                  <View style={styles.chipsRow}>
                    {grade ? (
                      <Chip icon="school" text={`Grade ${grade}`} />
                    ) : null}
                    {lesson ? (
                      <Chip icon="book" text={`Lesson ${lesson}`} />
                    ) : null}
                    <Chip icon="people" text={`${cls.participants?.length || 0} students`} />
                  </View>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Ionicons name="people" size={18} color={themeVariables.whiteColor} />
                  <Text style={styles.summaryText}>{cls.participants?.length || 0} Students</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Ionicons name="person" size={18} color={themeVariables.whiteColor} />
                  <Text style={styles.summaryText}>{cls.facilitators?.length || 0} Teachers</Text>
                </View>
              </View>

              <SectionScrollableGrid
                title="Teachers"
                items={cls.facilitators}
                emptyText="No teachers listed"
              />

              <SectionScrollableGrid
                title="Students"
                items={cls.participants}
                emptyText="No students enrolled"
              />
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container}>
        <TopNav title="My Class" onBack={onBack} containerStyle={styles.header} />

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          lazy
          lazyPreloadDistance={1}
          renderTabBar={(props) => (
            <TabBar
              {...props}
              indicatorStyle={styles.indicator}
              style={styles.tabBar}
              activeColor={themeVariables.whiteColor}
              inactiveColor="rgba(255,255,255,0.7)"
              scrollEnabled
              tabStyle={styles.tabStyle}
              labelStyle={styles.tabLabel}
              contentContainerStyle={styles.tabContent}
              renderLabel={({ route, focused, color }) => (
                <Text
                  numberOfLines={1}
                  style={[styles.tabTextOnly, focused ? styles.tabLabelActive : null, { color }]}
                >
                  {route.title}
                </Text>
              )}
            />
          )}
        />
      </SafeAreaView>
    </ScreenBackground>
  );
};

// Preload images for active tab (header + participant/facilitator avatars)
// Helps avoid visible loading lag when content mounts
const usePreloadForActiveTab = (entries, activeIndex) => {
  useEffect(() => {
    if (!Array.isArray(entries) || entries.length === 0) return;
    const active = entries[activeIndex];
    if (!active) return;
    const classes = (active?.classes || active?.class || []);
    const cls = classes[0]; // currently, only first class is shown
    if (!cls) return;
    const header = cls.imageUrl ? [cls.imageUrl] : [];
    const avatars = [
      ...(cls.facilitators || []).map((p) => p?.profilePicture || p?.avatar),
      ...(cls.participants || []).map((p) => p?.profilePicture || p?.avatar),
    ].filter(Boolean);
    preloadImages(header, { priority: 'high' });
    preloadImages(avatars, { priority: 'low' });
  }, [entries, activeIndex]);
};


const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'transparent'
  },
  header: {
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  scene: { flex: 1, paddingHorizontal: 16 },
  sceneContent: { paddingBottom: 48, paddingTop: 8 },
  card: {
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)'
  },
  cardHeader: { height: 140, width: '100%', overflow: 'hidden' },
  headerImage: { ...StyleSheet.absoluteFillObject, opacity: 0.8 },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(49,39,131,0.15)',
  },
  headerContent: { position: 'absolute', left: 12, bottom: 12, right: 12 },
  classTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipsRow: { flexDirection: 'row', alignItems: 'center' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  summaryItem: { flexDirection: 'row', alignItems: 'center' },
  summaryText: { color: themeVariables.whiteColor, marginLeft: 8, fontWeight: '600' },
  sectionBlock: { paddingHorizontal: 12, paddingBottom: 16 },
  sectionContainer: { position: 'relative' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: themeVariables.whiteColor, marginBottom: 8 },
  horizontalList: { flexDirection: 'row', alignItems: 'center' },
  gridList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sectionScrollable: {
    maxHeight: 180,
  },
  sectionFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 28,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  fadeHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fadeHintText: {
    color: themeVariables.whiteColor,
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.8,
  },
  studentPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flexBasis: '48%',
    maxWidth: '48%',
  },
  studentAvatar: { width: 36, height: 36, borderRadius: 18 },
  studentName: { color: themeVariables.whiteColor, marginLeft: 8, flexShrink: 1 },
  emptyText: { color: 'rgba(255,255,255,0.7)' },
  tabBar: { backgroundColor: 'transparent' },
  tabContent: { alignItems: 'flex-start', paddingLeft: 16 },
  tabStyle: { width: 'auto', paddingHorizontal: 12, alignItems: 'flex-start' },
  tabLabel: { textAlign: 'left' },
  tabTextOnly: { fontSize: 14, fontWeight: '600', textAlign: 'left' },
  tabLabelActive: { color: themeVariables.whiteColor },
  indicator: { backgroundColor: themeVariables.whiteColor },
});

export default ClassScreen;
