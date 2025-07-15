import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import themeVariables from '../styles/theme';

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const TILE_HEIGHT = 120;

const GradesScreen = ({ onGradeSelect }) => {
  const data = [
    { grade: 1, book: 'Book 3', ages: 'Ages 5-7' },
    { grade: 2, book: 'Book 3-1', ages: 'Ages 7-8' },
    { grade: 3, book: 'Book 3-2', ages: 'Ages 7-8' },
    { grade: 4, book: 'Book 3-3', ages: 'Ages 8-9' },
    { grade: 5, book: 'Book 3-4', ages: 'Ages 9-10' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Select Grade</Text>
        <TouchableOpacity>
          <Ionicons
            name="bookmark-outline"
            size={24}
            color={themeVariables.whiteColor}
          />
        </TouchableOpacity>
      </View>

      {/* Grade Cards */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {data.map((item, i) => {
          const range = item.ages.split(' ')[1] || item.ages;
          const pct = (item.grade / data.length) * 100;

          return (
            <TouchableOpacity
              key={i}
              style={styles.tile}
              activeOpacity={0.7}
              onPress={() => onGradeSelect(item.grade, item.setNumber)}
            >
              <View style={styles.left}>
                <Text style={styles.gradeText}>Grade {item.grade}</Text>
                <Text style={styles.bookText}>{item.book}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.ageLabel}>age</Text>
                <Text style={styles.ageValue}>{range}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${pct}%` }
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default GradesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeVariables.primaryColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    color: themeVariables.whiteColor,
    fontSize: 24,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 24,
  },
  tile: {
    height: TILE_HEIGHT,
    backgroundColor: themeVariables.tertiaryDarkColor,
    borderRadius: themeVariables.borderRadiusPill,
    marginBottom: 16,
    overflow: 'hidden',
  },
  left: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  right: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: 'center',
  },
  gradeText: {
    color: themeVariables.whiteColor,
    fontSize: 20,
    fontWeight: '500',
  },
  bookText: {
    color: themeVariables.whiteColor,
    fontSize: 16,
    marginTop: 4,
  },
  ageLabel: {
    color: themeVariables.whiteColor,
    fontSize: 12,
  },
  ageValue: {
    color: themeVariables.whiteColor,
    fontSize: 32,
    fontWeight: '300',
    marginTop: 2,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: themeVariables.whiteColor,
  },
});
