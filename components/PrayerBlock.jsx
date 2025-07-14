import React, { useState, useEffect, useRef } from 'react';
import {
  ImageBackground,
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
  backgroundImage,
  backgroundColor = themeVariables.neutralLight,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const cancelRef = useRef(false);

  const handleAudioPress = async () => {
    if (!prayer || !prayer.trim()) return;
    try {
      if (isSpeaking) {
        cancelRef.current = true;
        await speechService.stopTTS();
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
      speechService.stopTTS();
      speechService.cleanupTTSListeners();
    };
  }, []);

  return (
    <ImageBackground
      source={backgroundImage}
      style={[styles.background, { backgroundColor }]}
    >
      <Text style={styles.title}>Prayer</Text>
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    width: '100%',
    padding: 16,
    marginVertical: themeVariables.margin,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prayerText: {
    fontSize: 18,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: themeVariables.primaryColor,
    textAlign: 'center',
  },
  audioButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
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