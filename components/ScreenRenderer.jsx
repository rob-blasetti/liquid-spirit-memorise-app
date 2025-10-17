import React from 'react';
import { View, StyleSheet } from 'react-native';
import { isGameScreen } from '../navigation/router';
import {
  GradeSetLanding,
  GradeLessonSelector,
  GradeLessonContent,
  GradeComingSoon,
} from './GradeLayouts';
import GameRenderer from './GameRenderer';
import { GRADE_SCREEN_CONFIG } from '../data/gradesConfig';
import { sanitizeQuoteText } from '../services/quoteSanitizer';

const ensureLazy = (loader, fallbackModule) => {
  if (typeof React.lazy === 'function') {
    return React.lazy(loader);
  }
  return fallbackModule;
};

const GradesScreen = ensureLazy(
  () => import('../screens/GradesScreen'),
  require('../screens/GradesScreen').default,
);
const Grade1SetScreen = ensureLazy(
  () => import('../screens/Grade1SetScreen'),
  require('../screens/Grade1SetScreen').default,
);
const Grade1LessonScreen = ensureLazy(
  () => import('../screens/Grade1LessonScreen'),
  require('../screens/Grade1LessonScreen').default,
);
const SettingsScreen = ensureLazy(
  () => import('../screens/SettingsScreen'),
  require('../screens/SettingsScreen').default,
);
const AchievementsScreen = ensureLazy(
  () => import('../screens/AchievementsScreen'),
  require('../screens/AchievementsScreen').default,
);
const HomeScreen = ensureLazy(
  () => import('../screens/HomeScreen'),
  require('../screens/HomeScreen').default,
);
const GamesListScreen = ensureLazy(
  () => import('../screens/GamesListScreen'),
  require('../screens/GamesListScreen').default,
);
const ClassScreen = ensureLazy(
  () => import('../screens/ClassScreen'),
  require('../screens/ClassScreen').default,
);
const LessonJourneyScreen = ensureLazy(
  () => import('../screens/LessonJourneyScreen'),
  require('../screens/LessonJourneyScreen').default,
);
const StoryModeScreen = ensureLazy(
  () => import('../screens/StoryModeScreen'),
  require('../screens/StoryModeScreen').default,
);
const GameVictoryScreen = ensureLazy(
  () => import('../screens/GameVictoryScreen'),
  require('../screens/GameVictoryScreen').default,
);

export const SplashScreen = ensureLazy(
  () => import('../screens/Splash'),
  require('../screens/Splash').default,
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

  const {
    goHome,
    goGrade1,
    goGrade2,
    goGrade3,
    goGrade4,
    goGrade2Set,
    goGrade2Lesson,
    goGrade2b,
    goGrade2bSet,
    goGrade2bLesson,
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
    completedLessons,
  } = lessonState;

  const { deleteGuestAccount, wipeProfile, saveProfile, deleteRegisteredAccount } = accountActions;
  const { setProfileModalVisible, setComingSoonGrade } = modalHandlers;

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

  if (isGameScreen(currentNav.screen)) {
    const backHandler = (() => {
      if (currentNav.fromStoryMode) {
        return () => goTo('storyMode');
      }
      if (currentNav.fromGames) {
        return () => goTo('games');
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
        awardGameAchievement={awardGameAchievement}
        recordGamePlay={recordGamePlay}
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
      return renderLazy(
        <Grade1SetScreen
          onBack={() => goTo('grades')}
          onLessonSelect={(lessonNumber) => goTo('grade1Lesson', { lessonNumber })}
        />,
      );
    case 'grade1Lesson':
      return renderLazy(
        <Grade1LessonScreen
          lessonNumber={currentNav.lessonNumber}
          onBack={currentNav.from === 'journey' ? () => goTo('lessonJourney') : () => goTo('grades')}
          onComplete={(lesson) => {
            if (!lesson) return;
            completeLesson(null, lesson.lesson, lesson, { grade: 1, setNumber: lesson.lesson });
          }}
        />,
      );
    case 'grade2Lesson': {
      const config = GRADE_SCREEN_CONFIG[2];
      if (!config) return null;
      return (
        <GradeLessonContent
          gradeTitle={config.title}
          grade={config.grade}
          setNumber={currentNav.setNumber}
          lessonNumber={currentNav.lessonNumber}
          getLessonContent={config.getLessonContent}
          fallbackQuote={config.fallbackQuote}
          onBack={currentNav.from === 'journey' ? () => goTo('lessonJourney') : () => goTo('grades')}
          onComplete={completeLesson}
          onPractice={(quote) => goTo('practice', buildQuotePayload(quote))}
          onPlayGame={(quote) => goTo('tapGame', buildQuotePayload(quote))}
        />
      );
    }
    case 'grade2bLesson': {
      const config = GRADE_SCREEN_CONFIG['2b'];
      if (!config) return null;
      return (
        <GradeLessonContent
          gradeTitle={config.title}
          grade={config.grade}
          setNumber={currentNav.setNumber}
          lessonNumber={currentNav.lessonNumber}
          getLessonContent={config.getLessonContent}
          fallbackQuote={config.fallbackQuote}
          onBack={currentNav.from === 'journey' ? () => goTo('lessonJourney') : () => goTo('grades')}
          onComplete={completeLesson}
          onPractice={(quote) => goTo('practice', buildQuotePayload(quote))}
          onPlayGame={(quote) => goTo('tapGame', buildQuotePayload(quote))}
        />
      );
    }
    case 'grade2Set': {
      const config = GRADE_SCREEN_CONFIG[2];
      if (!config) return null;
      return (
        <GradeLessonSelector
          title={`${config.title} - Set ${currentNav.setNumber}`}
          lessonNumbers={config.lessonNumbers}
          onLessonSelect={goGrade2Lesson}
          onBack={() => goTo('grades')}
        />
      );
    }
    case 'grade2bSet': {
      const config = GRADE_SCREEN_CONFIG['2b'];
      if (!config) return null;
      return (
        <GradeLessonSelector
          title={`${config.title} - Set ${currentNav.setNumber}`}
          lessonNumbers={config.lessonNumbers}
          onLessonSelect={goGrade2bLesson}
          onBack={() => goTo('grades')}
        />
      );
    }
    case 'grade2': {
      const config = GRADE_SCREEN_CONFIG[2];
      if (!config) return null;
      return (
        <GradeSetLanding
          title={config.title}
          sets={config.sets}
          onSetSelect={goGrade2Set}
          onBack={() => goTo('grades')}
        />
      );
    }
    case 'grade2b': {
      const config = GRADE_SCREEN_CONFIG['2b'];
      if (!config) return null;
      return (
        <GradeSetLanding
          title={config.title}
          sets={config.sets}
          onSetSelect={goGrade2bSet}
          onBack={() => goTo('grades')}
        />
      );
    }
    case 'grade3': {
      const config = GRADE_SCREEN_CONFIG[3];
      if (!config) return null;
      return (
        <GradeComingSoon
          title={config.title}
          message={config.message}
          onBack={() => goTo('grades')}
        />
      );
    }
    case 'grade4': {
      const config = GRADE_SCREEN_CONFIG[4];
      if (!config) return null;
      return (
        <GradeComingSoon
          title={config.title}
          message={config.message}
          onBack={() => goTo('grades')}
        />
      );
    }
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
          currentProgress={getCurrentProgress()}
          overrideProgress={overrideProgress}
          onSaveOverride={setOverrideProgress}
          onBack={goHome}
          onReset={() => {
            if (profile?.guest) {
              deleteGuestAccount();
            } else {
              wipeProfile();
            }
          }}
          onSaveProfile={saveProfile}
          onDeleteAccount={profile?.guest ? undefined : deleteRegisteredAccount}
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
    case 'grades':
      return renderLazy(
        <GradesScreen
          onBack={goHome}
          comingSoonGrades={[3, 4, 5]}
          onComingSoonGrade={(grade) => setComingSoonGrade(grade)}
          onGradeSelect={(gradeValue, setNumber) => {
            if (gradeValue === 1) {
              goGrade1();
            } else if (gradeValue === 2) {
              if (setNumber === 2) {
                goGrade2b();
              } else if (setNumber) {
                goGrade2Set(setNumber);
              } else {
                goGrade2();
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
        />,
      );
    }
  }
};

export default ScreenRenderer;
