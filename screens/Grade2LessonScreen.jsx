import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const Grade2LessonScreen = ({ setNumber, lessonNumber, onBack, onComplete }) => {
  // Map of specific quotes per set and lesson
  const quoteMap = {
    '1-1': 'Intone, O My servant, the verses of God that have been received by thee, as intoned by them who have drawn nigh unto Him, that the sweetness of thy melody may kindle thine own soul, and attract the hearts of all men.',
    '1-2': 'It is the greatest longing of every soul who is attracted to the Kingdom of God to find time to turn with entire devotion to his Beloved, so as to seek His bounty and blessing and immerse himself in the ocean of communion, entreaty and supplication.',
    '1-3': 'O Son of Light! Forget all save Me and commune with My spirit. This is of the essence of My command, therefore turn unto it.',
    '2-1': 'O SON OF BEING! My love is My stronghold; he that entereth therein is safe and secure, and he that turneth away shall surely stray and perish.',
    '2-2': 'The Tongue of My power hath, from the heaven of My omnipotent glory, addressed to My creation these words: “Observe My commandments, for the love of My beauty.”',
    '2-3': 'Know assuredly that My commandments are the lamps of My loving providence among My servants, and the keys of My mercy for My creatures.',
    '3-1': 'The purpose of God in creating man hath been, and will ever be, to enable him to know his Creator and to attain His Presence.',
    '3-2': 'Exert every effort to acquire the various branches of knowledge and true understanding. Strain every nerve to achieve both material and spiritual accomplishments.',
    '3-3': 'He must search after the truth to the utmost of his ability and exertion, that God may guide him in the paths of His favour and the ways of His mercy.'
  };
  const quote = quoteMap[`${setNumber}-${lessonNumber}`]
    || `This is a dummy quote for Lesson ${lessonNumber} of Set ${setNumber}.`;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grade 2 - Set {setNumber} Lesson {lessonNumber}</Text>
      <Text style={styles.quote}>{quote}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Complete Lesson" onPress={() => onComplete(setNumber, lessonNumber)} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Back" onPress={onBack} />
      </View>
    </View>
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
    textAlign: 'center',
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    marginVertical: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default Grade2LessonScreen;