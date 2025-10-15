import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import speechService from '../services/speechService';
import themeVariables from '../styles/theme';

const PrayerBlock = ({
  prayer,
  profile,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [scrollMetrics, setScrollMetrics] = useState({
    containerHeight: 0,
    contentHeight: 0,
  });
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

  const handleScrollLayout = useCallback(({ nativeEvent }) => {
    const { height } = nativeEvent.layout;
    setScrollMetrics(prev =>
      prev.containerHeight === height
        ? prev
        : { ...prev, containerHeight: height }
    );
  }, []);

  const handleContentSizeChange = useCallback((_, height) => {
    setScrollMetrics(prev =>
      prev.contentHeight === height
        ? prev
        : { ...prev, contentHeight: height }
    );
  }, []);

  const isScrollable = scrollMetrics.contentHeight > scrollMetrics.containerHeight + 1;

  return (
    <View style={styles.container}>
      <View style={styles.textColumn}>
        <ScrollView
          style={styles.textScroll}
          contentContainerStyle={styles.textScrollContent}
          onLayout={handleScrollLayout}
          onContentSizeChange={handleContentSizeChange}
          scrollEnabled={isScrollable}
          showsVerticalScrollIndicator={isScrollable}
          nestedScrollEnabled
        >
          <Text style={styles.prayerText}>{prayer}</Text>
        </ScrollView>
      </View>
      <View style={styles.audioColumn}>
        {prayer && prayer.trim() ? (
          <TouchableOpacity
            style={[
              styles.audioButton,
              isSpeaking && styles.audioButtonActive,
            ]}
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
              name={isSpeaking ? 'stop-circle-outline' : 'play-circle-outline'}
              size={28}
              color={isSpeaking ? themeVariables.whiteColor : themeVariables.blackColor}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const AUDIO_BUTTON_SIZE = 40;
const AUDIO_COLUMN_WIDTH = 80;

const styles = StyleSheet.create({
  container: {
    width: '130%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    paddingTop: 8,
    paddingBottom: 16,
    alignSelf: 'stretch',
    paddingRight: 0,
  },
  textColumn: {
    flex: 1,
    paddingRight: 12,
    minHeight: 0,
  },
  textScroll: {
    maxHeight: '100%',
  },
  textScrollContent: {
    paddingRight: 2,
  },
  prayerText: {
    fontSize: 18,
    textAlign: 'left',
    color: themeVariables.whiteColor,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  audioColumn: {
    width: AUDIO_COLUMN_WIDTH,
    alignItems: 'center',
    paddingTop: 4,
  },
  audioButton: {
    width: AUDIO_BUTTON_SIZE,
    height: AUDIO_BUTTON_SIZE,
    borderRadius: AUDIO_BUTTON_SIZE / 2,
    borderWidth: 2,
    borderColor: themeVariables.primaryColor,
    backgroundColor: themeVariables.whiteColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  audioButtonActive: {
    backgroundColor: themeVariables.primaryColor,
    borderColor: themeVariables.primaryColor,
  },
});

export default PrayerBlock;
