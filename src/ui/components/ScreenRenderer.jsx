import React from 'react';
import { View, StyleSheet } from 'react-native';
import { isGameScreen } from '../../app/navigation/router';
import GameRenderer from './GameRenderer';
import { sanitizeQuoteText } from '../../services/quoteSanitizer';
import { resolveProfileId } from '../../services/profileUtils';
import { saveColoringProgress } from '../../services/coloringProgressService';

const ensureLazy = (loader, fallbackModule) => {
  if (typeof React.lazy === 'function') {
    return React.lazy(loader);
  }
  return fallbackModule;
};

const LibraryScreen = ensureLazy(
  () => import('../../screens/profile/LibraryScreen'),
  require('../../screens/profile/LibraryScreen').default,
);
const GradeScreen = ensureLazy(
  () => import('../../screens/profile/GradeScreen'),
  require('../../screens/profile/GradeScreen').default,
);
const SettingsScreen = ensureLazy(
  () => import('../../screens/profile/SettingsScreen'),
  require('../../screens/profile/SettingsScreen').default,
);
const AchievementsScreen = ensureLazy(
  () => import('../../screens/achievements/AchievementsScreen'),
  require('../../screens/achievements/AchievementsScreen').default,
);
const HomeScreen = ensureLazy(
  () => import('../../screens/profile/HomeScreen'),
  require('../../screens/profile/HomeScreen').default,
);
const GamesListScreen = ensureLazy(
  () => import('../../screens/games/GamesListScreen'),
  require('../../screens/games/GamesListScreen').default,
);
const ClassScreen = ensureLazy(
  () => import('../../screens/profile/ClassScreen'),
  require('../../screens/profile/ClassScreen').default,
);
const LessonJourneyScreen = ensureLazy(
  () => import('../../screens/profile/LessonJourneyScreen'),
  require('../../screens/profile/LessonJourneyScreen').default,
);
const StoryModeScreen = ensureLazy(
  () => import('../../screens/games/StoryModeScreen'),
  require('../../screens/games/StoryModeScreen').default,
);
const GameVictoryScreen = ensureLazy(
  () => import('../../screens/games/GameVictoryScreen'),
  require('../../screens/games/GameVictoryScreen').default,
);
const ColoringGalleryScreen = ensureLazy(
  () => import('../../screens/games/ColoringGalleryScreen'),
  require('../../screens/games/ColoringGalleryScreen').default,
);

export const SplashScreen = ensureLazy(
  () => import('../../screens/auth/SplashScreen'),
  require('../../screens/auth/SplashScreen').default,
);

const fallbackStyles = StyleSheet.create({
  fill: { flex: 1 },
});

const lazySymbol = typeof Symbol === 'function' && Symbol.for ? Symbol.for('react.lazy') : null;

export const renderLazy = (node) => {
  if (
    lazySymbol
    && node
    && node.type
    && node.type.$$typeof === lazySymbol
    && typeof React.Suspense === 'function'
  ) {
    return (
      <React.Suspense fallback={<View style={fallbackStyles.fill} />}>
        {node}
      </React.Suspense>
    );
  }
  return node;
};

const ScreenRenderer = ({
  navState,
  profile,
  user,
  achievements,
  childrenProfiles = [],
  level,
  navigationActions,
  goTo,
  appActions,
  lessonState,
  accountActions,
  modalHandlers,
  awardGameAchievement,
  recordGamePlay,
}) => {
  if (!navState) return null;

  const profileId = resolveProfileId(profile);

  const {
    goHome,
    goBackToLesson,
  } = navigationActions;

  const {
    playSelectedGame,
    getHomeProgress,
    launchStoryModeGame,
    getQuoteOfTheWeek,
  } = appActions;

  const {
    completeLesson,
    overrideProgress,
    setOverrideProgress,
    getCurrentProgress,
    getProgressForGrade,
    completedLessons,
  } = lessonState;

  const { deleteGuestAccount, wipeProfile, saveProfile, deleteRegisteredAccount } = accountActions;
  const { setProfileModalVisible, setComingSoonGrade } = modalHandlers;

  const isGuestProfile = Boolean(profile?.guest || profile?.type === 'guest');
  const isGuestUser = Boolean(user?.type === 'guest' || user?.guest);

  const currentNav = navState;
  const buildQuotePayload = (incomingQuote, extra = {}) => {
    const rawText =
      typeof incomingQuote === 'string'
        ? incomingQuote
        : (incomingQuote && typeof incomingQuote.text === 'string' && incomingQuote.text) || '';
    const sanitizedText = sanitizeQuoteText(rawText);
    return {
      quote: sanitizedText,
      rawQuote: rawText,
      sanitizedQuote: sanitizedText,
      ...extra,
    };
  };

  const handleSaveColoring = async (imageId, drawing) => {
    try {
      if (profileId && imageId) {
        await saveColoringProgress(profileId, imageId, drawing || {});
      }
    } catch (error) {
      console.warn('Saving coloring progress failed', error);
    }
    goTo('coloringGallery', { highlightImageId: imageId });
  };

  const goToGradeJourney = (gradeValue) => {
    const gradeKey = String(gradeValue || '');
    const progress =
      typeof getProgressForGrade === 'function'
        ? getProgressForGrade(gradeKey)
        : getCurrentProgress();
    const resolvedLessonNumber = Number(progress?.lessonNumber) || 1;
    if (gradeKey === '1') {
      goTo('grade1Lesson', { lessonNumber: resolvedLessonNumber });
      return;
    }
    if (gradeKey === '2b') {
      const resolvedSetNumber = Number(progress?.setNumber) || 4;
      goTo('grade2bLesson', { setNumber: resolvedSetNumber, lessonNumber: resolvedLessonNumber });
      return;
    }
    if (gradeKey === '2') {
      const resolvedSetNumber = Number(progress?.setNumber) || 1;
      goTo('grade2Lesson', { setNumber: resolvedSetNumber, lessonNumber: resolvedLessonNumber });
    }
  };

  if (isGameScreen(currentNav.screen)) {
    const backHandler = (() => {
      if (currentNav.fromStoryMode) {
        return () => goTo('storyMode');
      }
      if (currentNav.fromGames) {
        return () => goTo('games');
      }
      if (currentNav.fromGallery) {
        return () => goTo('coloringGallery', { highlightImageId: currentNav.imageId });
      }
      if (currentNav.fromHome) {
        return () => goTo('home');
      }
      return goBackToLesson;
    })();
    const { screen: _screen, ...navSnapshot } = currentNav;
    return (
      <GameRenderer
        screen={currentNav.screen}
        quote={currentNav.quote}
        rawQuote={currentNav.rawQuote}
        sanitizedQuote={currentNav.sanitizedQuote}
        onBack={backHandler}
        initialImageId={currentNav.imageId}
        awardGameAchievement={awardGameAchievement}
        recordGamePlay={recordGamePlay}
        coloringInitialDrawing={currentNav.drawing}
        onSaveColoring={handleSaveColoring}
        onVictory={(details = {}) => {
          const resolvedLevel =
            typeof details.level === 'number' ? details.level : level ?? 1;
          goTo('gameVictory', {
            ...navSnapshot,
            gameId: currentNav.screen,
            gameTitle: details.gameTitle,
            difficultyLabel: details.difficultyLabel,
            level: resolvedLevel,
            perfect: Boolean(details.perfect),
          });
        }}
      />
    );
  }

  switch (currentNav.screen) {
    case 'gameVictory':
      return renderLazy(
        <GameVictoryScreen
          gameTitle={currentNav.gameTitle}
          difficultyLabel={currentNav.difficultyLabel}
          level={currentNav.level}
          perfect={currentNav.perfect}
          maxLevel={3}
          onReplay={() => {
            const replayPayload = {
              quote: currentNav.quote,
              rawQuote: currentNav.rawQuote,
              sanitizedQuote: currentNav.sanitizedQuote,
              setNumber: currentNav.setNumber,
              lessonNumber: currentNav.lessonNumber,
              fromGames: currentNav.fromGames,
              fromStoryMode: currentNav.fromStoryMode,
              lessonScreen: currentNav.lessonScreen,
            };
            goTo(currentNav.gameId, replayPayload);
          }}
          onNextLevel={() => {
            const nextPayload = {
              quote: currentNav.quote,
              rawQuote: currentNav.rawQuote,
              sanitizedQuote: currentNav.sanitizedQuote,
              setNumber: currentNav.setNumber,
              lessonNumber: currentNav.lessonNumber,
              fromGames: currentNav.fromGames,
              fromStoryMode: currentNav.fromStoryMode,
              lessonScreen: currentNav.lessonScreen,
            };
            goTo(currentNav.gameId, nextPayload);
          }}
          onGoHome={() => goTo('home')}
          onGoGames={currentNav.fromGames ? () => goTo('games') : undefined}
        />,
      );
    case 'grade1':
    case 'grade1Lesson':
      return renderLazy(
        <GradeScreen
          grade={1}
          lessonNumber={currentNav.lessonNumber}
          from={currentNav.from}
          onBackToLibrary={() => goTo('grades')}
          onBackToJourney={() => goTo('lessonJourney')}
          onSelectLesson={(_setNumber, lessonNumber) => goTo('grade1Lesson', { lessonNumber })}
          onComplete={completeLesson}
          onPractice={(quote) => goTo('practice', buildQuotePayload(quote))}
          onPlayGame={(quote) => goTo('tapGame', buildQuotePayload(quote))}
        />,
      );
    case 'grade2':
    case 'grade2Set':
    case 'grade2Lesson':
      return renderLazy(
        <GradeScreen
          grade={2}
          setNumber={currentNav.setNumber}
          lessonNumber={currentNav.lessonNumber}
          from={currentNav.from}
          onBackToLibrary={() => goTo('grades')}
          onBackToJourney={() => goTo('lessonJourney')}
          onSelectLesson={(setNumber, lessonNumber) => goTo('grade2Lesson', { setNumber, lessonNumber })}
          onComplete={completeLesson}
          onPractice={(quote) => goTo('practice', buildQuotePayload(quote))}
          onPlayGame={(quote) => goTo('tapGame', buildQuotePayload(quote))}
        />,
      );
    case 'grade2b':
    case 'grade2bSet':
    case 'grade2bLesson':
      return renderLazy(
        <GradeScreen
          grade="2b"
          setNumber={currentNav.setNumber}
          lessonNumber={currentNav.lessonNumber}
          from={currentNav.from}
          onBackToLibrary={() => goTo('grades')}
          onBackToJourney={() => goTo('lessonJourney')}
          onSelectLesson={(setNumber, lessonNumber) => goTo('grade2bLesson', { setNumber, lessonNumber })}
          onComplete={completeLesson}
          onPractice={(quote) => goTo('practice', buildQuotePayload(quote))}
          onPlayGame={(quote) => goTo('tapGame', buildQuotePayload(quote))}
        />,
      );
    case 'grade3':
    case 'grade4':
      return renderLazy(
        <GradeScreen
          grade={currentNav.screen === 'grade4' ? 4 : 3}
          onBackToLibrary={() => goTo('grades')}
          onBackToJourney={() => goTo('lessonJourney')}
        />,
      );
    case 'storyMode': {
      const { quote, setNumber, lessonNumber } = getQuoteOfTheWeek();
      return renderLazy(
        <StoryModeScreen
          profile={profile}
          quote={quote}
          setNumber={setNumber}
          lessonNumber={lessonNumber}
          onBack={goHome}
          onStartGame={launchStoryModeGame}
        />,
      );
    }
    case 'achievements':
      return renderLazy(<AchievementsScreen onBack={goHome} />);
    case 'games':
      return renderLazy(
        <GamesListScreen
          onSelect={playSelectedGame}
          onBack={goHome}
        />,
      );
    case 'settings':
      return renderLazy(
        <SettingsScreen
          profile={profile}
          user={user}
          currentProgress={getCurrentProgress()}
          overrideProgress={overrideProgress}
          onSaveOverride={setOverrideProgress}
          onBack={goHome}
          onReset={() => {
            if (isGuestProfile) {
              deleteGuestAccount();
            } else {
              wipeProfile();
            }
          }}
          onSaveProfile={saveProfile}
          onDeleteAccount={!isGuestUser && user ? deleteRegisteredAccount : undefined}
        />,
      );
    case 'class':
      return renderLazy(<ClassScreen childEntries={childrenProfiles || []} onBack={goHome} />);
    case 'lessonJourney':
      return renderLazy(
        <LessonJourneyScreen
          profile={profile}
          currentProgress={getCurrentProgress()}
          completedLessons={completedLessons}
          onBack={goHome}
          goToLesson={(setNumber, lessonNumber) => {
            if (profile.grade === 1) {
              goTo('grade1Lesson', { lessonNumber, from: 'journey' });
            } else if (profile.grade === 2) {
              goTo('grade2Lesson', { setNumber, lessonNumber, from: 'journey' });
            } else if (profile.grade === '2b') {
              goTo('grade2bLesson', { setNumber, lessonNumber, from: 'journey' });
            }
          }}
        />,
      );
    case 'coloringGallery':
      return renderLazy(
        <ColoringGalleryScreen
          profile={profile}
          highlightImageId={currentNav.highlightImageId}
          onBack={goHome}
          onSelectImage={(imageId, drawing) => {
            goTo('coloringBookGame', {
              fromGallery: true,
              imageId,
              drawing,
            });
          }}
        />,
      );
    case 'grades':
      return renderLazy(
        <LibraryScreen
          onBack={goHome}
          comingSoonGrades={[3, 4, 5]}
          grade={profile?.grade}
          profileId={profileId}
          currentProgress={getCurrentProgress()}
          completedLessons={completedLessons}
          onContinue={() => goToGradeJourney(profile?.grade)}
          onComingSoonGrade={(grade) => setComingSoonGrade(grade)}
          onGradeSelect={(gradeValue) => {
            if (gradeValue === 1) {
              goTo('grade1');
            } else if (gradeValue === 2) {
              const preferredGrade = String(profile?.grade || '') === '2b' ? '2b' : 2;
              const progress =
                typeof getProgressForGrade === 'function'
                  ? getProgressForGrade(String(preferredGrade))
                  : getCurrentProgress();
              const resolvedSetNumber =
                preferredGrade === '2b'
                  ? Number(progress?.setNumber) || 4
                  : Number(progress?.setNumber) || 1;
              if (preferredGrade === '2b') {
                goTo('grade2b', { setNumber: resolvedSetNumber });
              } else {
                goTo('grade2', { setNumber: resolvedSetNumber });
              }
            }
          }}
        />,
      );
    default: {
      const { setNumber, lessonNumber } = getHomeProgress();
      return renderLazy(
        <HomeScreen
          profile={profile}
          achievements={achievements}
          currentSet={setNumber}
          currentLesson={lessonNumber}
          onAvatarPress={() => setProfileModalVisible(true)}
          onJourney={() => goTo('lessonJourney')}
          onOpenSettings={() => goTo('settings')}
          onOpenAchievements={() => goTo('achievements')}
          onOpenClass={() => goTo('class')}
          onOpenLibrary={() => goTo('grades')}
          onOpenGames={() => goTo('games')}
          onOpenColoring={() => {
            goTo('coloringGallery');
          }}
        />,
      );
    }
  }
};

export default ScreenRenderer;
