import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import ThemedButton from '../../../ui/components/ThemedButton';
import { grade1Lessons } from '../../../utils/data/core/grade1';
import { useProfile } from '../../../hooks/useProfile';
import PrayerBlock from '../../../ui/components/PrayerBlock';
import QuoteBlock from '../../../ui/components/QuoteBlock';

const Grade1Screen = ({ onBack }) => {
  const { profile } = useProfile();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Grade 1</Text>
      {grade1Lessons.map(l => (
        <View key={l.lesson} style={styles.lessonContainer}>
          <Text style={styles.lessonTitle}>
            Lesson {l.lesson} - {l.virtue}
          </Text>
          {l.prayer ? (
            <PrayerBlock prayer={l.prayer} profile={profile} />
          ) : null}
          {l.quote ? (
            <QuoteBlock quote={l.quote} profile={profile} />
          ) : null}
        </View>
      ))}
      <View style={styles.buttonContainer}>
        <ThemedButton title="Back" onPress={onBack} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: '#666',
  },
  lessonContainer: {
    marginBottom: 24,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  prayer: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default Grade1Screen;
