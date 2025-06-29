import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { TabView, TabBar } from 'react-native-tab-view';
import Avatar from '@flipxyz/react-native-boring-avatars';
import theme from '../styles/theme';
const ClassScreen = ({ childEntries = [], onBack }) => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const routes = childEntries.map((entry, i) => ({
    key: entry.child._id || i.toString(),
    title: `${entry.child.firstName} ${entry.child.lastName}`,
  }));

  const renderScene = ({ route }) => {
    const entry = childEntries.find(e => (e.child._id || '').toString() === route.key) || {
      child: {},
      classes: [],
    };
    const { classes = [] } = entry;

    return (
      <ScrollView style={styles.scene}>
        {classes.map((cls, classIndex) => (
          <View key={cls.id || cls._id || classIndex} style={styles.card}>
            {cls.imageUrl && (
              <View style={styles.banner}>
                <FastImage
                  source={{ uri: cls.imageUrl, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable }}
                  style={styles.bannerImage}
                  resizeMode={FastImage.resizeMode.cover}
                />
                <Text style={styles.classTitle}>{cls.title}</Text>
              </View>
            )}
            <Text style={styles.curriculumLesson}>
              {cls.curriculumLesson
                ? `Grade: ${cls.curriculumLesson.grade}, Lesson: ${cls.curriculumLesson.lessonNumber}`
                : ''}
            </Text>
            {cls.groupDetails && (
              <View style={styles.group}>
                <Text style={styles.groupText}>Day: {cls.groupDetails.day}</Text>
                <Text style={styles.groupText}>Time: {cls.groupDetails.time}</Text>
                <Text style={styles.groupText}>Freq: {cls.groupDetails.frequency}</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Teachers</Text>
            {cls.facilitators?.map((f, facIndex) => (
              <View key={f.id || f._id || facIndex} style={styles.personContainer}>
                {f.profilePicture ? (
                  <FastImage
                    source={{ uri: f.profilePicture, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable }}
                    style={styles.profileImage}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                ) : (
                  <Avatar
                    size={40}
                    name={`${f.firstName} ${f.lastName}`}
                    variant="beam"
                  />
                )}
                <Text style={styles.personName}>
                  {f.firstName} {f.lastName}
                </Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Students</Text>
            {cls.participants?.map((p, partIndex) => (
              <View key={p.id || p._id || partIndex} style={styles.personContainer}>
                {p.profilePicture ? (
                  <FastImage
                    source={{ uri: p.profilePicture, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable }}
                    style={styles.profileImage}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                ) : (
                  <Avatar
                    size={40}
                    name={`${p.firstName} ${p.lastName}`}
                    variant="beam"
                  />
                )}
                <Text style={styles.personName}>
                  {p.firstName} {p.lastName}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Childrens Classes</Text>
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={styles.indicator}
            style={styles.tabBar}
            activeColor={theme.primaryColor}
            inactiveColor="#333"
            labelStyle={styles.tabLabel}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: theme.primaryColor,
    fontSize: 16,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scene: { flex: 1, padding: 16 },
  card: {
    marginBottom: 24,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  banner: {
    height: 120,
    width: '100%',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  classTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 8,
  },
  curriculumLesson: { margin: 12, fontSize: 16 },
  group: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  groupText: { fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginHorizontal: 12, marginTop: 12 },
  personContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginHorizontal: 12 },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  personName: { marginLeft: 8, fontSize: 14 },
  tabBar: { backgroundColor: '#fff' },
  tabLabel: { fontSize: 14, fontWeight: '600' },
  indicator: { backgroundColor: theme.primaryColor },
});

export default ClassScreen;
