import React, { useEffect } from 'react';
import ReactTestRenderer from 'react-test-renderer';

const mockOnVictory = jest.fn();
const mockAwardGameAchievement = jest.fn();
const mockRecordGamePlay = jest.fn();
const mockMarkDifficultyComplete = jest.fn();
const mockGoTo = jest.fn();

jest.mock('../screens/GradesScreen', () => () => null);
jest.mock('../screens/Grade1SetScreen', () => () => null);
jest.mock('../screens/Grade1LessonScreen', () => () => null);
jest.mock('../screens/SettingsScreen', () => () => null);
jest.mock('../screens/AchievementsScreen', () => () => null);
jest.mock('../screens/HomeScreen', () => () => null);
jest.mock('../screens/GamesListScreen', () => () => null);
jest.mock('../screens/ClassScreen', () => () => null);
jest.mock('../screens/LessonJourneyScreen', () => () => null);
jest.mock('../screens/StoryModeScreen', () => () => null);
jest.mock('../screens/GameVictoryScreen', () => () => null);
jest.mock('../screens/Splash', () => () => null);

jest.mock('../games/lazyGameRoutes', () => {
  const React = require('react');
  const { useEffect } = React;
  const TestGame = (props) => {
    useEffect(() => {
      props.onWin?.({ perfect: true });
    }, [props]);
    return null;
  };
  return { lazyGameScreens: { testGame: TestGame } };
});

jest.mock('../contexts/DifficultyContext', () => ({
  useDifficulty: () => ({ level: 2 }),
}));

jest.mock('../contexts/UserContext', () => ({
  useUser: () => ({ markDifficultyComplete: mockMarkDifficultyComplete }),
}));

jest.mock('../components/DifficultyFAB', () => () => null);
jest.mock('../components/LostOverlay', () => () => null);

describe('GameRenderer victory flow', () => {
  beforeEach(() => {
    mockOnVictory.mockClear();
    mockAwardGameAchievement.mockClear();
    mockRecordGamePlay.mockClear();
    mockMarkDifficultyComplete.mockClear();
    mockGoTo.mockClear();
  });

  it('invokes onVictory with game summary when a game reports a win', async () => {
    const GameRenderer = require('../components/GameRenderer').default;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <GameRenderer
          screen="testGame"
          quote="test quote"
          awardGameAchievement={mockAwardGameAchievement}
          recordGamePlay={mockRecordGamePlay}
          onVictory={mockOnVictory}
          onBack={jest.fn()}
        />,
      );
    });

    expect(mockOnVictory).toHaveBeenCalledWith(
      expect.objectContaining({
        screenId: 'testGame',
        level: 2,
        perfect: true,
      }),
    );
    expect(mockMarkDifficultyComplete).toHaveBeenCalledWith(2);
  });

  it('navigates to the victory screen when a game is won', async () => {
    const ScreenRenderer = require('../components/ScreenRenderer').default;
    const navigationActions = {
      goHome: jest.fn(),
      goGrade1: jest.fn(),
      goGrade2: jest.fn(),
      goGrade3: jest.fn(),
      goGrade4: jest.fn(),
      goGrade2Set: jest.fn(),
      goGrade2Lesson: jest.fn(),
      goGrade2b: jest.fn(),
      goGrade2bSet: jest.fn(),
      goGrade2bLesson: jest.fn(),
      goBackToLesson: jest.fn(),
    };
    const appActions = {
      playSelectedGame: jest.fn(),
      getHomeProgress: jest.fn(() => ({ setNumber: 1, lessonNumber: 1 })),
      launchStoryModeGame: jest.fn(),
      getQuoteOfTheWeek: jest.fn(),
    };
    const lessonState = {
      completeLesson: jest.fn(),
      overrideProgress: {},
      setOverrideProgress: jest.fn(),
      getCurrentProgress: jest.fn(() => ({ setNumber: 1, lessonNumber: 1 })),
      completedLessons: [],
    };
    const accountActions = {
      deleteGuestAccount: jest.fn(),
      wipeProfile: jest.fn(),
      saveProfile: jest.fn(),
    };
    const modalHandlers = {
      setProfileModalVisible: jest.fn(),
      setComingSoonGrade: jest.fn(),
    };

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <ScreenRenderer
          navState={{
            screen: 'testGame',
            quote: 'test quote',
            rawQuote: 'test quote',
            sanitizedQuote: 'test quote',
            setNumber: 1,
            lessonNumber: 1,
            fromGames: true,
          }}
          profile={{ id: 'p1' }}
          achievements={[]}
          childrenProfiles={[]}
          level={2}
          navigationActions={navigationActions}
          goTo={mockGoTo}
          appActions={appActions}
          lessonState={lessonState}
          accountActions={accountActions}
          modalHandlers={modalHandlers}
          awardGameAchievement={mockAwardGameAchievement}
          recordGamePlay={mockRecordGamePlay}
        />,
      );
    });

    expect(mockGoTo).toHaveBeenCalledWith(
      'gameVictory',
      expect.objectContaining({
        gameId: 'testGame',
        fromGames: true,
        perfect: true,
      }),
    );
  });
});
