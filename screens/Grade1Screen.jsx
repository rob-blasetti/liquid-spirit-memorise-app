import React from 'react';
import { ScrollView, View, Text, Button, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';

export const prayers = [
  'He is God! O God, my God! Bestow upon me a pure heart, like unto a pearl.',
  'O God, guide me, protect me, make of me a shining lamp and a brilliant star. Thou art the Mighty and the Powerful.',
  'Blessed is the spot, and the house, and the place, and the city, and the heart, and the mountain, and the refuge, and the cave, and the valley, and the land, and the sea, and the island, and the meadow where mention of God hath been made, and His praise glorified.',
  'O Lord! Plant this tender seedling in the garden of Thy manifold bounties, water it from the fountains of Thy loving-kindness and grant that it may grow into a goodly plant through the outpourings of Thy favour and grace. Thou art the Mighty and the Powerful.',
  'Thy name is my healing, O my God, and remembrance of Thee is my remedy.  Nearness to Thee is my hope, and love for Thee is my companion.  Thy mercy to me is my healing and my succor in both this world and the world to come. Thou, verily, art the All-Bountiful, the All-Knowing, the All-Wise.',
  'O Thou kind Lord!  I am a little child, exalt me by admitting me to the kingdom.  I am earthly, make me heavenly; I am of the world below, let me belong to the realm above; gloomy, suffer me to become radiant; material, make me spiritual, and grant that I may manifest Thine infinite bounties. Thou art the Powerful, the All-Loving.',
];

export const grade1Lessons = [
  {
    lesson: 1,
    virtue: 'Purity',
    prayer: prayers[0],
    quote:
      'O Son of Spirit! My first counsel is this: Possess a pure, kindly and radiant heart …',
  },
  { lesson: 2, virtue: 'Justice', prayer: prayers[0], quote: 'Tread ye the path of justice, for this, verily, is the straight path.' },
  { lesson: 3, virtue: 'Love', prayer: prayers[0], quote: 'O Friend! In the garden of thy heart plant naught but the rose of love …' },
  { lesson: 4, virtue: 'Truthfulness', prayer: prayers[0], quote: 'Truthfulness is the foundation of all human virtues.' },
  {
    lesson: 5,
    virtue: 'Generosity',
    prayer: prayers[1],
    quote:
      'To give and to be generous are attributes of Mine; well is it with him that adorneth himself with My virtues.',
  },
  { lesson: 6, virtue: 'Selflessness', prayer: prayers[1], quote: 'Blessed is he who preferreth his brother before himself.' },
  {
    lesson: 7,
    virtue: 'Joy',
    prayer: prayers[1],
    quote:
      'O Son of Man! Rejoice in the gladness of thine heart, that thou mayest be worthy to meet Me and to mirror forth My beauty.',
  },
  { lesson: 8, virtue: 'Sincerity', prayer: prayers[1], quote: 'We should at all times manifest our truthfulness and sincerity …' },
  {
    lesson: 9,
    virtue: 'Humility',
    prayer: prayers[2],
    quote:
      'O Son of Man! Humble thyself before Me, that I may graciously visit thee.',
  },
  {
    lesson: 10,
    virtue: 'Gratitude',
    prayer: prayers[2],
    quote:
      'Be thou happy. Be thou grateful. Arise to render thanks unto God, that thy thankfulness may conduce to an increase of bounty.',
  },
  {
    lesson: 11,
    virtue: 'Forgiveness',
    prayer: prayers[2],
    quote:
      '…let your adorning be forgiveness and mercy and that which cheereth the hearts of the well-favored of God.',
  },
  {
    lesson: 12,
    virtue: 'Honesty',
    prayer: prayers[2],
    quote:
      'Beautify your tongues, O people, with truthfulness, and adorn your souls with the ornament of honesty.',
  },
  {
    lesson: 13,
    virtue: 'Compassion',
    prayer: prayers[3],
    quote:
      'The Kingdom of God is founded upon equity and justice, and also upon mercy, compassion, and kindness to every living soul.',
  },
  { lesson: 14, virtue: 'Detachment', prayer: prayers[3], quote: 'Know that thy true adornment consisteth in the love of God and in thy detachment from all save Him …' },
  { lesson: 15, virtue: 'Contentment', prayer: prayers[3], quote: 'The source of all glory is acceptance of whatsoever the Lord hath bestowed, and contentment with that which God hath ordained.' },
  { lesson: 16, virtue: 'Kindness', prayer: prayers[3], quote: 'Blessed is he who mingleth with all men in a spirit of utmost kindliness and love.' },
  {
    lesson: 17,
    virtue: 'Courage',
    prayer: prayers[4],
    quote:
      'The source of courage and power is the promotion of the Word of God, and steadfastness in His Love.',
  },
  {
    lesson: 18,
    virtue: 'Hope',
    prayer: prayers[4],
    quote:
      'Never lose thy trust in God. Be thou ever hopeful, for the bounties of God never cease to flow upon man.',
  },
  {
    lesson: 19,
    virtue: 'Trustworthiness',
    prayer: prayers[4],
    quote:
      'Trustworthiness is the greatest portal leading unto the tranquility and security of the people.',
  },
  {
    lesson: 20,
    virtue: 'Enkindlement',
    prayer: prayers[4],
    quote:
      'Be ye enkindled, O people, with the heat of the love of God, that ye may enkindle the hearts of others.',
  },
  {
    lesson: 21,
    virtue: 'Radiance',
    prayer: prayers[5],
    quote:
      'O Son of Being! Thou art My lamp and My light is in thee. Get thou from it thy radiance and seek none other than Me.',
  },
  {
    lesson: 22,
    virtue: 'Faithfulness',
    prayer: prayers[5],
    quote:
      'Happy is the faithful one who is attired with the vesture of high endeavor and hath arisen to serve this Cause.',
  },
  {
    lesson: 23,
    virtue: 'Patience',
    prayer: prayers[5],
    quote:
      'He, verily, shall increase the reward of them that endure with patience.',
  },
  {
    lesson: 24,
    virtue: 'Steadfastness',
    prayer: prayers[5],
    quote:
      'Supremely lofty will be thy station, if thou remainest steadfast in the Cause of thy Lord.',
  },
];

const Grade1Screen = ({ onBack }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Grade 1</Text>
      {grade1Lessons.map(l => (
        <View key={l.lesson} style={styles.lessonContainer}>
          <Text style={styles.lessonTitle}>
            Lesson {l.lesson} - {l.virtue}
          </Text>
          <Text style={styles.prayer}>{l.prayer}</Text>
          <Text style={styles.quote}>{l.quote}</Text>
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
