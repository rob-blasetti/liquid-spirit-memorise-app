import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import speechService from '../services/speechService';
import themeVariables from '../styles/theme';

const PrayerBlock = ({
  prayer,
  profile,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const cancelRef = useRef(false);

  const handleAudioPress = async () => {
    if (!prayer || !prayer.trim()) return;
    try {
      if (isSpeaking) {
        cancelRef.current = true;
        await speechService.hardStop();
        setIsSpeaking(false);
      } else {
        cancelRef.current = false;
        setIsSpeaking(true);
        speechService.readQuote(prayer, profile?.ttsVoice, cancelRef);
      }
    } catch (err) {
      console.warn('TTS failed:', err);
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    const onTTSFinish = () => setIsSpeaking(false);
    speechService.setupTTSListeners(onTTSFinish);

    return () => {
      cancelRef.current = true;
      speechService.hardStop();
      speechService.cleanupTTSListeners();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.prayerText}>{prayer}</Text>
      {prayer && prayer.trim() && (
        <TouchableOpacity
          style={styles.audioButton}
          onPress={handleAudioPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel={
            isSpeaking ? 'Stop reading prayer' : 'Read prayer aloud'
          }
          accessibilityHint={
            isSpeaking
              ? 'Double tap to stop the speech'
              : 'Double tap to hear this prayer'
          }
        >
          <Ionicons
            name={
              isSpeaking ? 'stop-circle-outline' : 'play-circle-outline'
            }
            size={24}
            color={themeVariables.primaryColor}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    paddingTop: 8,
    paddingBottom: 48,
    alignSelf: 'stretch',
  },
  prayerText: {
    fontSize: 18,
    textAlign: 'center',
  },
  audioButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: themeVariables.whiteColor,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
});

export default PrayerBlock;
