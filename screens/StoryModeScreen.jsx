import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button as StyleguideButton } from 'liquid-spirit-styleguide';
import QuoteBlock from '../components/QuoteBlock';
import themeVariables from '../styles/theme';
import TopNav from '../components/TopNav';

const StoryModeScreen = ({
  profile,
  quote,
  setNumber,
  lessonNumber,
  onBack,
  onStartGame,
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  const safeQuote = typeof quote === 'string' ? quote.trim() : '';
  const hasQuote = safeQuote.length > 0;
  const firstName = profile?.firstName ? profile.firstName.trim() : null;
  const focusLabel = useMemo(() => {
    if (setNumber && lessonNumber) {
      return `Set ${setNumber} · Lesson ${lessonNumber}`;
    }
    if (lessonNumber) {
      return `Lesson ${lessonNumber}`;
    }
    if (setNumber) {
      return `Set ${setNumber}`;
    }
    return null;
  }, [setNumber, lessonNumber]);

  const steps = useMemo(() => {
    const friendlyName = firstName || 'you';
    return [
      {
        id: 'quote',
        title: 'Quote of the Week',
        description: 'Read the words we will explore together.',
        icon: 'book-outline',
        ctaLabel: 'Next',
        render: () =>
          hasQuote ? (
            <QuoteBlock quote={quote} profile={profile} />
          ) : (
            <Text style={styles.emptyQuoteText}>
              We are still preparing this week&apos;s quote. Check back soon!
            </Text>
          ),
      },
      {
        id: 'reflect',
        title: 'Connect the Story',
        description: `Picture a moment where these words could guide ${friendlyName}.`,
        icon: 'sparkles-outline',
        ctaLabel: 'Continue',
        render: () => (
          <View style={styles.stepList}>
            <Text style={styles.stepListItem}>
              • Imagine what is happening in the scene of the quote.
            </Text>
            <Text style={styles.stepListItem}>
              • Think about how you might explain the quote to a friend.
            </Text>
            <Text style={styles.stepListItem}>
              • Notice the words that feel the most important to remember.
            </Text>
          </View>
        ),
      },
      {
        id: 'play',
        title: 'Ready to Play',
        description: 'Take on the Tap Missing Words game to bring the quote to life.',
        icon: 'game-controller-outline',
        ctaLabel: 'Play Tap Missing Words',
        render: () => (
          <View style={styles.stepList}>
            <Text style={styles.stepListItem}>
              • You will see the quote a line at a time.
            </Text>
            <Text style={styles.stepListItem}>
              • Tap the missing words as quickly and carefully as you can.
            </Text>
            <Text style={styles.stepListItem}>
              • Each round helps the quote sink in so it stays with you all week.
            </Text>
          </View>
        ),
      },
    ];
  }, [firstName, hasQuote, quote, profile]);

  const totalSteps = steps.length;
  const currentStep = steps[stepIndex] || steps[0];
  const isLastStep = stepIndex === totalSteps - 1;
  const progressPercent = Math.min(100, ((stepIndex + 1) / totalSteps) * 100);

  const handleAdvance = () => {
    if (isLastStep) {
      if (typeof onStartGame === 'function') {
        onStartGame();
      }
      return;
    }
    setStepIndex(prev => Math.min(totalSteps - 1, prev + 1));
  };

  const handleStepBack = () => {
    setStepIndex(prev => Math.max(0, prev - 1));
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="Story Mode" onBack={onBack} containerStyle={styles.header} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressMeta}>
          <Text style={styles.progressText}>
            Step {Math.min(stepIndex + 1, totalSteps)} of {totalSteps}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {focusLabel ? (
          <View style={styles.focusPill}>
            <Ionicons
              name="compass-outline"
              size={16}
              color={themeVariables.primaryColor}
              style={styles.focusIcon}
            />
            <Text style={styles.focusText}>{focusLabel}</Text>
          </View>
        ) : null}

        <View style={styles.stepCard}>
          <View style={styles.stepIconWrapper}>
            <Ionicons name={currentStep.icon} size={28} color={themeVariables.primaryColor} />
          </View>
          <Text style={styles.stepTitle}>{currentStep.title}</Text>
          <Text style={styles.stepSubtitle}>{currentStep.description}</Text>
          <View style={styles.stepBody}>{currentStep.render()}</View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {stepIndex > 0 ? (
          <StyleguideButton
            label="Back"
            onPress={handleStepBack}
            secondary
            size="medium"
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />
        ) : (
          <View style={styles.footerSpacer} />
        )}
        <StyleguideButton
          label={currentStep.ctaLabel}
          onPress={handleAdvance}
          primary
          size="large"
          style={styles.primaryButton}
          textStyle={styles.primaryButtonText}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingHorizontal: 0,
    paddingTop: 12,
    paddingBottom: 20,
  },
  content: {
    paddingBottom: 32,
  },
  progressMeta: {
    marginBottom: 16,
  },
  progressText: {
    color: themeVariables.whiteColor,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: themeVariables.secondaryColor,
  },
  focusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  focusIcon: {
    marginRight: 6,
  },
  focusText: {
    color: themeVariables.primaryColor,
    fontSize: 14,
    fontWeight: '600',
  },
  stepCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  stepIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  stepTitle: {
    color: themeVariables.whiteColor,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepSubtitle: {
    color: themeVariables.whiteColor,
    fontSize: 15,
    opacity: 0.85,
    marginBottom: 20,
  },
  stepBody: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  stepList: {
  },
  stepListItem: {
    color: themeVariables.whiteColor,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  emptyQuoteText: {
    color: themeVariables.whiteColor,
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  secondaryButton: {
    minWidth: 120,
    marginRight: 12,
  },
  secondaryButtonText: {
    color: themeVariables.primaryColor,
  },
  footerSpacer: {
    minWidth: 120,
    marginRight: 12,
  },
  primaryButton: {
    flex: 1,
  },
  primaryButtonText: {
    fontWeight: '700',
  },
});

export default StoryModeScreen;
